import { useState } from "react";
import type { FormEvent } from "react";
import type { RegisterPayload } from "../types/financialGrid.types";

type LoginPanelProps = {
  error: string;
  loading: boolean;
  onRegister: (payload: RegisterPayload) => Promise<boolean>;
  onSubmit: (email: string, password: string) => Promise<void>;
  success: string;
};

export function LoginPanel({
  error,
  loading,
  onRegister,
  onSubmit,
  success,
}: LoginPanelProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isRegister) {
      const registered = await onRegister({
        fullName,
        birthDate,
        email,
        password,
      });
      if (registered) {
        setMode("login");
        setFullName("");
        setBirthDate("");
        setPassword("");
      }
      return;
    }

    await onSubmit(email, password);
  }

  function switchMode(nextMode: "login" | "register") {
    setMode(nextMode);
    setEmail("");
    setPassword("");
  }

  return (
    <form
      className={`login-panel ${isRegister ? "login-panel--register" : ""}`}
      onSubmit={handleSubmit}
    >
      <div className="login-panel__header">
        <div className="brand-lockup brand-lockup--login">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="eyebrow">Ordinis</span>
        </div>
        <h1>{isRegister ? "Criar conta" : "Entrar"}</h1>
        <p>
          {isRegister
            ? "Informe seus dados para iniciar seu acesso."
            : "Use sua conta para acessar a planilha financeira."}
        </p>
      </div>

      <div className="auth-tabs" role="tablist" aria-label="Acesso">
        <button
          aria-selected={!isRegister}
          className={!isRegister ? "is-active" : ""}
          onClick={() => switchMode("login")}
          role="tab"
          type="button"
        >
          Entrar
        </button>
        <button
          aria-selected={isRegister}
          className={isRegister ? "is-active" : ""}
          onClick={() => switchMode("register")}
          role="tab"
          type="button"
        >
          Cadastrar
        </button>
      </div>

      {error ? <div className="alert">{error}</div> : null}
      {success ? <div className="alert alert--success">{success}</div> : null}

      {isRegister ? (
        <>
          <label className="field">
            <span>Nome</span>
            <input
              autoComplete="name"
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              type="text"
            />
          </label>

          <label className="field">
            <span>Nascimento</span>
            <input
              autoComplete="bday"
              required
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
              type="date"
            />
          </label>
        </>
      ) : null}

      <label className="field">
        <span>Email</span>
        <input
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
        />
      </label>

      <label className="field">
        <span>Senha</span>
        <input
          autoComplete={isRegister ? "new-password" : "current-password"}
          minLength={8}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
        />
      </label>

      <button className="button button--primary" disabled={loading}>
        {loading
          ? isRegister
            ? "Cadastrando..."
            : "Entrando..."
          : isRegister
            ? "Criar conta"
            : "Entrar"}
      </button>

    </form>
  );
}
