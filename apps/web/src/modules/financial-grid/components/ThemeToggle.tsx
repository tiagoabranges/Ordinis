import type { ThemeMode } from "../hooks/useTheme";

type ThemeToggleProps = {
  theme: ThemeMode;
  onToggle: () => void;
};

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      type="button"
      aria-label="Alternar tema"
    >
      <span className="theme-toggle__track">
        <span className="theme-toggle__thumb" />
      </span>
      {theme === "dark" ? "Dark" : "Light"}
    </button>
  );
}
