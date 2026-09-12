import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import "@/App.css";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { WsProvider } from "./context/WsContext";

import Landing from "./pages/Landing";
import AuthPage from "./pages/AuthPage";
import QuizPage from "./pages/QuizPage";
import ChatPage from "./pages/ChatPage";
import SwellPage from "./pages/SwellPage";
import ProfilePage from "./pages/ProfilePage";
import PeoplePage from "./pages/PeoplePage";
import ActivityPage from "./pages/ActivityPage";
import CallsPage from "./pages/CallsPage";
import FilesPage from "./pages/FilesPage";
import Sidebar from "./components/Sidebar";

function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-zinc-500 bg-[#09090B]">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function AppShell() {
  return (
    <div className="min-h-screen h-screen flex bg-[#09090B] text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex min-w-0"><Outlet /></div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WsProvider>
        <BrowserRouter>
          <Toaster position="top-right" theme="dark" richColors />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/signup" element={<AuthPage mode="signup" />} />
            <Route element={<RequireAuth />}>
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/app" element={<AppShell />}>
                <Route index element={<Navigate to="chat" replace />} />
                <Route path="activity" element={<ActivityPage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="chat/:cid" element={<ChatPage />} />
                <Route path="swell" element={<SwellPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="profile/:uid" element={<ProfilePage />} />
                <Route path="people" element={<PeoplePage />} />
                <Route path="calls" element={<CallsPage />} />
                <Route path="files" element={<FilesPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </WsProvider>
    </AuthProvider>
  );
}
