import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register, forgotPassword, resetPassword } from "../services/api";
import "./AuthPage.css";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // "login" | "register" | "forgot"

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>EcoCampus</h1>
          <p>Compartilhe materiais acadêmicos com outros estudantes.</p>
        </div>

        {mode !== "forgot" && (
          <div className="auth-switch">
            <button
              className={mode === "login" ? "active" : ""}
              onClick={() => setMode("login")}
            >
              Entrar
            </button>
            <button
              className={mode === "register" ? "active" : ""}
              onClick={() => setMode("register")}
            >
              Cadastrar
            </button>
          </div>
        )}

        {mode === "login" && <LoginForm onForgotPassword={() => setMode("forgot")} />}
        {mode === "register" && <RegisterForm />}
        {mode === "forgot" && <ForgotPasswordFlow onBack={() => setMode("login")} />}
      </div>
    </div>
  );
}

function LoginForm({ onForgotPassword }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { ok, data } = await login(email, password);
      if (ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.name);
        localStorage.setItem("userId", data.id);
        navigate("/dashboard");
      } else {
        alert(data.message);
      }
    } catch {
      alert("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </button>

      <button
        type="button"
        className="link-btn"
        onClick={onForgotPassword}
      >
        Esqueci minha senha
      </button>
    </form>
  );
}

function RegisterForm() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { ok, data } = await register(name, email, password);
      if (ok) {
        alert("Conta criada! Faça login para continuar.");
        navigate("/");
      } else {
        alert(data.message);
      }
    } catch {
      alert("Erro ao cadastrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleRegister}>
      <input
        type="text"
        placeholder="Nome completo"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Criando conta..." : "Criar Conta"}
      </button>
    </form>
  );
}

function ForgotPasswordFlow({ onBack }) {
  const navigate = useNavigate();
  const [step, setStep] = useState("email"); // "email" | "reset" | "done"
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState(null);

  async function handleRequestReset(e) {
    e.preventDefault();
    setLoading(true);
    setInfo(null);
    try {
      const { data } = await forgotPassword(email);
      if (data.reset_token) {
        setResetToken(data.reset_token);
        setStep("reset");
        setInfo({
          type: "success",
          text: "Código de redefinição gerado. Como este projeto não envia e-mails reais, o código já foi preenchido abaixo para você continuar.",
        });
      } else {
        setInfo({ type: "success", text: data.message });
        setStep("reset");
      }
    } catch {
      setInfo({ type: "error", text: "Erro ao conectar com o servidor." });
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestReset(e) {
    e.preventDefault();
    setLoading(true);
    setInfo(null);
    try {
      const { data } = await forgotPassword(email);
      setInfo({ type: "success", text: data.message });
      setStep("reset");
    } catch {
      setInfo({ type: "error", text: "Erro ao conectar com o servidor." });
    } finally {
      setLoading(false);
    }
  }

  if (step === "done") {
    return (
      <div className="auth-form">
        <p className="auth-info success">Senha redefinida com sucesso!</p>
        <button type="button" onClick={() => navigate("/")}>
          Voltar para o login
        </button>
      </div>
    );
  }

  return (
    <div className="auth-form">
      {step === "email" && (
        <form onSubmit={handleRequestReset} className="auth-form" style={{ padding: 0 }}>
          <p className="auth-help-text">
            Informe seu e-mail cadastrado para gerar um código de redefinição de senha.
          </p>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {info && <p className={`auth-info ${info.type}`}>{info.text}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Gerar código de redefinição"}
          </button>
          <button type="button" className="link-btn" onClick={onBack}>
            Voltar para o login
          </button>
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={handleResetPassword} className="auth-form" style={{ padding: 0 }}>
          {info && <p className={`auth-info ${info.type}`}>{info.text}</p>}
          <input
            type="text"
            placeholder="Código de redefinição"
            value={resetToken}
            onChange={(e) => setResetToken(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirmar nova senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Redefinir senha"}
          </button>
          <button type="button" className="link-btn" onClick={onBack}>
            Voltar para o login
          </button>
        </form>
      )}
    </div>
  );
}
