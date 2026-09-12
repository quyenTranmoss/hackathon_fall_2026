import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "./Avatar";
import { ChatCircleDots, VideoCamera, Files, User, Sparkle, SignOut, House, MagnifyingGlass } from "@phosphor-icons/react";

const NAV = [
  { to: "/app/activity", label: "Activity", icon: House, testid: "nav-activity" },
  { to: "/app/chat", label: "Chat", icon: ChatCircleDots, testid: "nav-chat" },
  { to: "/app/swell", label: "Swell AI", icon: Sparkle, testid: "nav-swell", accent: true },
  { to: "/app/calls", label: "Calls", icon: VideoCamera, testid: "nav-calls" },
  { to: "/app/files", label: "Files", icon: Files, testid: "nav-files" },
  { to: "/app/people", label: "People", icon: MagnifyingGlass, testid: "nav-people" },
  { to: "/app/profile", label: "Profile", icon: User, testid: "nav-profile" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <aside className="w-20 lg:w-64 bg-[#0C0C0E] border-r border-[#1c1c1f] flex flex-col shrink-0">
      <div className="p-4 flex items-center gap-2">
        <div className="w-9 h-9 rounded-md swell-gradient flex items-center justify-center shrink-0">
          <Sparkle size={18} weight="fill" className="text-black" />
        </div>
        <span className="heading font-semibold hidden lg:block">Swell Teams</span>
      </div>
      <nav className="flex-1 px-2 py-2 space-y-1">
        {NAV.map((item) => (
          <NavLink
            key={item.to} to={item.to}
            data-testid={item.testid}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                isActive
                  ? item.accent ? "swell-tint text-[#FF9000] border border-[rgba(255,93,1,0.35)]" : "bg-[#1C1C1F] text-white"
                  : "text-zinc-400 hover:text-white hover:bg-[#141416]"
              }`
            }
          >
            <item.icon size={20} weight={item.accent ? "fill" : "regular"} />
            <span className="hidden lg:block">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-[#1c1c1f] flex items-center gap-3">
        <button
          onClick={() => nav("/app/profile")}
          className="flex items-center gap-3 flex-1 min-w-0"
          data-testid="sidebar-user-button"
        >
          <Avatar name={user.name} color={user.avatar_color} size={36} showStatus status="online" />
          <div className="hidden lg:block text-left min-w-0">
            <div className="text-sm font-medium truncate">{user.name}</div>
            <div className="text-xs text-zinc-500 mono">{user.personality_type || "Take the quiz"}</div>
          </div>
        </button>
        <button
          onClick={() => { logout(); nav("/login"); }}
          className="text-zinc-500 hover:text-white p-2"
          data-testid="sidebar-logout"
          title="Log out"
        >
          <SignOut size={18} />
        </button>
      </div>
    </aside>
  );
}
