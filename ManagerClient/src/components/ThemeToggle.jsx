// ThemeToggle.jsx
import { useTheme } from "./ThemeContext";
import { Sun, Moon } from "lucide-react"; // or any icon library you use

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-btn"
      aria-label="Toggle dark/light theme"
    >
      {theme === "light" ? <Moon /> : <Sun />}
    </button>
  );
}
