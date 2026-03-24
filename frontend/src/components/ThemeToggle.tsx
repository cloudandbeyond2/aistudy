
import { useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);

    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition"
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}
