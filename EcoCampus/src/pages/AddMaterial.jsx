import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { createMaterial } from "../services/api";
import "./AddMaterial.css";

export default function AddMaterial() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Livro");
  const [quality, setQuality] = useState("A");
  const [transaction, setTransaction] = useState("Troca");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!title.trim()) {
      alert("Preencha o título do material.");
      return;
    }
    setLoading(true);
    try {
      const { ok, data } = await createMaterial({
        title,
        description,
        category,
        quality,
        transaction,
      });
      if (ok) {
        alert("Material cadastrado!");
        navigate("/my-materials");
      } else {
        alert(data.message || "Erro ao cadastrar.");
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
          <h1>Cadastrar Material</h1>

          <input
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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

          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar Material"}
          </button>
        </div>
      </div>
    </>
  );
}
