import { useOutletContext } from "react-router-dom";
import { ThemeToggle } from "../modules/financial-grid/components/ThemeToggle";
import type { ThemeMode } from "../modules/financial-grid/hooks/useTheme";

type PlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
};

type PlaceholderOutletContext = {
  theme: ThemeMode;
  toggleTheme: () => void;
};

export function PlaceholderPage({
  eyebrow,
  title,
  description,
}: PlaceholderPageProps) {
  const { theme, toggleTheme } = useOutletContext<PlaceholderOutletContext>();

  return (
    <>
      <header className="topbar">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
        </div>
        <div className="topbar__actions">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      <section className="placeholder-page">
        <p>{description}</p>
      </section>
    </>
  );
}
