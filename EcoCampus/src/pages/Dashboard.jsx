import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import DashboardCard from "../components/DashboardCard";
import MaterialCard from "../components/MaterialCard";
import RequestCard from "../components/RequestCard";
import { getMyMaterials, getReceivedRequests } from "../services/api";
import "./Dashboard.css";

export default function Dashboard() {
  const userName = localStorage.getItem("userName") || "Usuário";

  const [materials, setMaterials] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [mats, reqs] = await Promise.all([
          getMyMaterials(),
          getReceivedRequests(),
        ]);
        setMaterials(mats);
        setRequests(reqs);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const available = materials.filter(m => m.status === "Disponível").length;
  const pending   = requests.filter(r => r.status === "Pendente").length;

  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        <section className="hero">
          <h1>Olá, {userName} 👋</h1>
          <p>Compartilhe conhecimento e ajude outros estudantes.</p>
          <div className="hero-buttons">
            <Link to="/material/new">
              <button>Cadastrar Material</button>
            </Link>
            <Link to="/marketplace">
              <button className="secondary">Explorar Marketplace</button>
            </Link>
          </div>
        </section>

        <section className="stats">
          <DashboardCard value={materials.length} title="Meus Materiais" />
          <DashboardCard value={available}        title="Disponíveis" />
          <DashboardCard value={pending}          title="Solicitações" />
          <DashboardCard value="—"               title="Trocas Concluídas" />
        </section>

        <section className="content">
          <div className="materials-section">
            <div className="section-header">
              <h2>Meus Materiais</h2>
            </div>
            {loading ? (
              <p>Carregando...</p>
            ) : materials.length === 0 ? (
              <p>Nenhum material cadastrado.</p>
            ) : (
              materials.slice(0, 3).map(material => (
                <MaterialCard key={material.id} material={material} />
              ))
            )}
          </div>

          <div className="requests-section">
            <h2>Solicitações Recentes</h2>
            {loading ? (
              <p>Carregando...</p>
            ) : requests.length === 0 ? (
              <p>Nenhuma solicitação recebida.</p>
            ) : (
              requests.slice(0, 3).map(request => (
                <RequestCard key={request.id} request={request} />
              ))
            )}
          </div>
        </section>
      </div>
    </>
  );
}
