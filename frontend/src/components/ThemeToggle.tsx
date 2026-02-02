
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { Toggle } from "./ui/toggle";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme } = useTheme(); // We only need the current theme state here
  
  return (
    <div className={`pl-2 cursor-pointer ${className}`}>
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </div>
  );
}
