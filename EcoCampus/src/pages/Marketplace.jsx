import { useState, useEffect } from "react";
import MarketplaceCard from "../components/MarketplaceCard";
import Navbar from "../components/Navbar";
import { getMaterials } from "../services/api";
import "./Marketplace.css";

export default function Marketplace() {
  const [search, setSearch] = useState("");
  const [materials, setMaterials] = useState([]);
  const [category, setCategory] = useState("Todas Categorias");
  const [quality, setQuality] = useState("Todas Qualidades");
  const [transaction, setTransaction] = useState("Todas Transações");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMaterials()
      .then(data => setMaterials(data))
      .catch(err => console.error("Erro ao carregar materiais:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = materials.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "Todas Categorias" || m.category === category;
    const matchQuality = quality === "Todas Qualidades" || m.quality === quality;
    const matchTransaction = transaction === "Todas Transações" || m.transaction === transaction;
    return matchSearch && matchCategory && matchQuality && matchTransaction;
  });

  return (
    <>
      <Navbar />
      <div className="marketplace">
        <div className="marketplace-header">
          <h1>Marketplace</h1>
          <input
            type="text"
            placeholder="Pesquisar materiais..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filters">
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option>Todas Categorias</option>
            <option>Livro</option>
            <option>Calculadora</option>
            <option>Apostila</option>
            <option>Outro</option>
          </select>

          <select value={quality} onChange={e => setQuality(e.target.value)}>
            <option>Todas Qualidades</option>
            <option>A</option>
            <option>B</option>
            <option>C</option>
          </select>

          <select value={transaction} onChange={e => setTransaction(e.target.value)}>
            <option>Todas Transações</option>
            <option>Troca</option>
            <option>Doação</option>
            <option>Empréstimo</option>
          </select>
        </div>

        {loading ? (
          <p>Carregando materiais...</p>
        ) : filtered.length === 0 ? (
          <p>Nenhum material encontrado.</p>
        ) : (
          <div className="market-grid">
            {filtered.map(material => (
              <MarketplaceCard key={material.id} material={material} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
