import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getMyRequests } from "../services/api";
import "./Requests.css";

const STATUS_COLOR = {
  Pendente:   "#f59e0b",
  Aceita:     "#10b981",
  Recusada:   "#ef4444",
  Finalizada: "#6366f1",
  Cancelada:  "#9ca3af",
};

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyRequests()
      .then(data => setRequests(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="requests-page">
        <h1>Minhas Solicitações</h1>

        {loading ? (
          <p>Carregando...</p>
        ) : requests.length === 0 ? (
          <p>Nenhuma solicitação encontrada.</p>
        ) : (
          requests.map(request => (
            <div key={request.id} className="request-item">
              <h3>{request.material}</h3>
              <p>Proprietário: {request.owner}</p>
              <p>Tipo: {request.type}</p>
              <span style={{ color: STATUS_COLOR[request.status] || "#000" }}>
                {request.status}
              </span>
            </div>
          ))
        )}
      </div>
    </>
  );
}