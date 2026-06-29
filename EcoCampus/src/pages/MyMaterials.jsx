import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getMyMaterials, deleteMaterial } from "../services/api";
import "./MyMaterials.css";

export default function MyMaterials() {
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyMaterials()
      .then(data => setMaterials(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = materials.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja remover este material?")) return;
    const { ok } = await deleteMaterial(id);
    if (ok) {
      setMaterials(materials.filter(m => m.id !== id));
    } else {
      alert("Erro ao remover material.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="materials-page">
        <div className="materials-header">
          <div>
            <h1>Meus Materiais</h1>
            <p>Gerencie seus materiais acadêmicos.</p>
          </div>
          <Link to="/material/new">
            <button className="add-material-btn">+ Novo Material</button>
          </Link>
        </div>

        <div className="materials-search">
          <input
            type="text"
            placeholder="Pesquisar material..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p>Carregando...</p>
        ) : filtered.length === 0 ? (
          <p>Nenhum material encontrado.</p>
        ) : (
          <div className="materials-grid">
            {filtered.map(material => (
              <div key={material.id} className="material-card">
                <div className="material-info">
                  <h3>{material.title}</h3>
                  <p>Qualidade: <strong>{material.quality}</strong></p>
                  <p>Tipo: <strong>{material.transaction}</strong></p>
                  <span className="status-badge">{material.status}</span>
                </div>
                <div className="material-actions">
                  <Link to={`/material/edit/${material.id}`}>
                    <button className="edit-btn">Editar</button>
                  </Link>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(material.id)}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
