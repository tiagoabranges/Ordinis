import { useState } from "react";
import type { FormEvent } from "react";

type LoginPanelProps = {
  error: string;
  loading: boolean;
  onSubmit: (email: string, password: string) => Promise<void>;
};

export function LoginPanel({ error, loading, onSubmit }: LoginPanelProps) {
  const [email, setEmail] = useState("demo@ordinis.app");
  const [password, setPassword] = useState("demo12345");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(email, password);
  }

  return (
    <form className="login-panel" onSubmit={handleSubmit}>
      <div className="brand-lockup brand-lockup--login">
        <span className="brand-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="eyebrow">Ordinis</span>
      </div>
      <h1>Planilha financeira</h1>

      {error ? <div className="alert">{error}</div> : null}

      <label className="field">
        <span>Email</span>
        <input
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
        />
      </label>

      <label className="field">
        <span>Senha</span>
        <input
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
        />
      </label>

      <button className="button button--primary" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
