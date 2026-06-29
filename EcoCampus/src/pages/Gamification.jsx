import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "./Gamification.css";

const BASE_URL = "http://127.0.0.1:5000";

export default function Gamification() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${BASE_URL}/gamification/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(d => setData(d))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <><Navbar /><p style={{ padding: "2rem" }}>Carregando...</p></>;
  if (!data)   return <><Navbar /><p style={{ padding: "2rem" }}>Erro ao carregar.</p></>;

  const { nome, pontos, nivel, progresso, conquistas, estatisticas, recompensas } = data;

  return (
    <>
      <Navbar />
      <div className="gamification-page">
        <h1> Seu nível</h1>

        {/* Card de nível */}
        <div className="nivel-card" style={{ borderColor: nivel.cor }}>
          <div className="nivel-header">
            <span className="nivel-badge-big">{nivel.badge}</span>
            <div>
              <h2 style={{ color: nivel.cor }}>{nivel.nivel}</h2>
              <p>{nome}</p>
              <span className="pontos-total">{pontos} pontos</span>
            </div>
          </div>

          {/* Barra de progresso */}
          {progresso.proximo && (
            <div className="progress-section">
              <div className="progress-label">
                <span>Progresso para <strong>{progresso.proximo.badge} {progresso.proximo.nivel}</strong></span>
                <span>{progresso.faltam} pts restantes</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progresso.percent}%`, background: nivel.cor }}
                />
              </div>
              <span className="progress-percent">{progresso.percent}%</span>
            </div>
          )}
          {!progresso.proximo && (
            <div className="progress-section">
              <p className="max-nivel">🏆 Você atingiu o nível máximo!</p>
            </div>
          )}
        </div>

        {/* Estatísticas */}
        <div className="stats-card">
          <h2>📊 Suas Estatísticas</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-icon">🎁</span>
              <span className="stat-value">{estatisticas.doacoes}</span>
              <span className="stat-label">Doações</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🔄</span>
              <span className="stat-value">{estatisticas.trocas}</span>
              <span className="stat-label">Trocas</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">📚</span>
              <span className="stat-value">{estatisticas.emprestimos}</span>
              <span className="stat-label">Empréstimos</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">📦</span>
              <span className="stat-value">{estatisticas.materiais}</span>
              <span className="stat-label">Materiais</span>
            </div>
          </div>
        </div>

        {/* Conquistas */}
        <div className="conquistas-card">
          <h2>🏅 Conquistas</h2>
          <div className="conquistas-grid">
            {conquistas.map(c => (
              <div
                key={c.id}
                className={`conquista-item ${c.desbloqueada ? "desbloqueada" : "bloqueada"}`}
              >
                <span className="conquista-icone">{c.icone}</span>
                <div className="conquista-info">
                  <strong>{c.nome}</strong>
                  <small>{c.descricao}</small>
                  <span className="conquista-pontos">+{c.pontos} pts</span>
                </div>
                {c.desbloqueada
                  ? <span className="conquista-status ok">✅</span>
                  : <span className="conquista-status lock">🔒</span>
                }
              </div>
            ))}
          </div>
        </div>

        {/* Recompensas por nível */}
        <div className="recompensas-card">
          <h2>🎁 Recompensas por Nível</h2>
          <div className="recompensas-list">
            {recompensas.map(r => (
              <div
                key={r.nivel}
                className={`recompensa-item ${r.desbloqueada ? "desbloqueada" : "bloqueada"}`}
              >
                <span className="recompensa-badge">{r.badge}</span>
                <div className="recompensa-info">
                  <strong style={{ color: r.cor }}>{r.nivel}</strong>
                  <p>{r.recompensa}</p>
                </div>
                {r.desbloqueada
                  ? <span className="check">✅ Desbloqueado</span>
                  : <span className="lock">🔒 Bloqueado</span>
                }
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}