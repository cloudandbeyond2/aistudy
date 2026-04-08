import React from "react";
import { Bot } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const ChatBotFloatingIcon = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const role = sessionStorage.getItem("role");

  const isStudentPortal = location.pathname.startsWith("/dashboard/student");
  const isChatBotScreen = location.pathname === "/dashboard/ai-mock-room";

  if (role !== "student") return null;
  if (!isStudentPortal) return null;
  if (isChatBotScreen) return null;

  return (
    <button
      type="button"
      aria-label="Open Chat Bot"
      title="Chat Bot"
      onClick={() => navigate("/dashboard/ai-mock-room")}
      className="fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xl shadow-indigo-500/25 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center"
    >
      <Bot className="h-7 w-7" />
    </button>
  );
};

export default ChatBotFloatingIcon;

