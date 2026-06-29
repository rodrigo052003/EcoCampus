import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "./History.css";

const BASE_URL = "http://127.0.0.1:5000";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${BASE_URL}/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setHistory(Array.isArray(data) ? data : []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="history-page">
        <h1>Histórico</h1>

        {loading ? (
          <p>Carregando...</p>
        ) : history.length === 0 ? (
          <p>Nenhuma transação encontrada.</p>
        ) : (
          history.map((item, index) => (
            <div key={item.id || index} className="history-item">
              <h3>{item.type || item.tipo}</h3>
              <p>{item.material || item.titulo}</p>
              <small>{item.data_transacao
                ? new Date(item.data_transacao).toLocaleDateString("pt-BR")
                : item.date}
              </small>
            </div>
          ))
        )}
      </div>
    </>
  );
}
