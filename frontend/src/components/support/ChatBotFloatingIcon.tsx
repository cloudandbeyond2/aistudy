import React from "react";
import { MessageCircle } from "lucide-react";
import { useLocation } from "react-router-dom";

const ChatBotFloatingIcon = () => {
  const location = useLocation();

  const role = sessionStorage.getItem("role");

  const isDashboardPage = location.pathname.startsWith("/dashboard");
  const canShow = role === "student";

  if (!canShow) return null;
  if (!isDashboardPage) return null;

  return (
    <button
      type="button"
      aria-label="Open Live Support"
      title="Live Support"
      onClick={() => window.dispatchEvent(new CustomEvent("open-live-support"))}
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-xl shadow-cyan-500/25 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center"
    >
      <MessageCircle className="h-7 w-7" />
    </button>
  );
};

export default ChatBotFloatingIcon;

