import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { updateMaterial, getMaterials } from "../services/api";
import "./AddMaterial.css";

export default function EditMaterial() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Livro");
  const [quality, setQuality] = useState("A");
  const [transaction, setTransaction] = useState("Troca");
  const [loading, setLoading] = useState(false);

  // Carrega os dados atuais do material
  useEffect(() => {
    getMaterials().then(data => {
      const material = data.find(m => m.id === parseInt(id));
      if (material) {
        setTitle(material.title || "");
        setDescription(material.description || "");
        setCategory(material.category || "Livro");
        setQuality(material.quality || "A");
        setTransaction(material.transaction || "Troca");
      }
    });
  }, [id]);

  async function handleSave() {
    if (!title.trim()) {
      alert("Preencha o título do material.");
      return;
    }
    setLoading(true);
    try {
      const { ok, data } = await updateMaterial(id, {
        title,
        description,
        category,
        quality,
        transaction,
      });
      if (ok) {
        alert("Material atualizado!");
        navigate("/my-materials");
      } else {
        alert(data.message || "Erro ao atualizar.");
      }
    } catch {
      alert("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="form-page">
        <div className="form-card">
          <h1>Editar Material</h1>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título"
          />

          <textarea
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>Livro</option>
            <option>Calculadora</option>
            <option>Apostila</option>
            <option>Outro</option>
          </select>

          <select value={quality} onChange={(e) => setQuality(e.target.value)}>
            <option>A</option>
            <option>B</option>
            <option>C</option>
          </select>

          <select value={transaction} onChange={(e) => setTransaction(e.target.value)}>
            <option>Troca</option>
            <option>Empréstimo</option>
            <option>Doação</option>
          </select>

          <button onClick={handleSave} disabled={loading}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </>
  );
}