import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/api";
import "./AuthPage.css";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setInfo({ type: "error", text: "As senhas não coincidem." });
      return;
    }
    setLoading(true);
    setInfo(null);
    try {
      const { ok, data } = await resetPassword(token, password);
      if (ok) {
        setInfo({ type: "success", text: "Senha redefinida com sucesso!" });
        setTimeout(() => navigate("/"), 2000);
      } else {
        setInfo({ type: "error", text: data.message || "Token inválido ou expirado." });
      }
    } catch {
      setInfo({ type: "error", text: "Erro ao conectar com o servidor." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>EcoCampus</h1>
          <p>Redefinição de senha</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
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
          {info && <p className={`auth-info ${info.type}`}>{info.text}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Redefinir senha"}
          </button>
        </form>
      </div>
    </div>
  );
}