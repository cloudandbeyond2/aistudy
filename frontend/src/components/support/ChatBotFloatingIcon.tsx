import React from "react";
import { Bot } from "lucide-react";
import { useLocation } from "react-router-dom";

const ChatBotFloatingIcon = () => {
  const location = useLocation();

  const role = sessionStorage.getItem("role");

  const isDashboardPage = location.pathname.startsWith("/dashboard");
  const isChatBotScreen = location.pathname === "/dashboard/ai-mock-room";
  const canShow = role === "student" || role === "org_admin";

  if (!canShow) return null;
  if (!isDashboardPage) return null;
  if (isChatBotScreen) return null;

  return (
    <button
      type="button"
      aria-label="Open Chat Bot"
      title="Chat Bot"
      onClick={() => window.dispatchEvent(new CustomEvent("open-live-support"))}
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xl shadow-indigo-500/25 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center"
    >
      <Bot className="h-7 w-7" />
    </button>
  );
};

export default ChatBotFloatingIcon;

