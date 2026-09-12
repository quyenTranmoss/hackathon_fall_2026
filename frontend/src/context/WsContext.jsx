import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { wsUrl } from "../lib/api";
import { useAuth } from "./AuthContext";

const WsCtx = createContext(null);

export function WsProvider({ children }) {
  const { user } = useAuth();
  const wsRef = useRef(null);
  const [online, setOnline] = useState(new Set());
  const listenersRef = useRef(new Set());

  const onMessage = useCallback((cb) => {
    listenersRef.current.add(cb);
    return () => listenersRef.current.delete(cb);
  }, []);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("swell_token");
    if (!token) return;

    let closed = false;
    const connect = () => {
      const ws = new WebSocket(wsUrl(token));
      wsRef.current = ws;
      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          if (data.type === "presence") {
            setOnline((prev) => {
              const next = new Set(prev);
              if (data.status === "online") next.add(data.user_id);
              else next.delete(data.user_id);
              return next;
            });
          }
          listenersRef.current.forEach((cb) => cb(data));
        } catch { /* ignore malformed frames */ }
      };
      ws.onclose = () => {
        if (!closed) setTimeout(connect, 2000);
      };
    };
    connect();
    return () => { closed = true; wsRef.current?.close(); };
  }, [user]);

  return (
    <WsCtx.Provider value={{ online, onMessage }}>{children}</WsCtx.Provider>
  );
}

export const useWs = () => useContext(WsCtx);
