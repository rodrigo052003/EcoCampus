import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getMyMaterials } from "../services/api";

const BASE_URL = "http://127.0.0.1:5000";

export default function Profile() {
  const userName = localStorage.getItem("userName") || "Usuário";
  const [materials, setMaterials] = useState([]);
  const [reputation, setReputation] = useState(0);

  useEffect(() => {
    getMyMaterials().then(data => setMaterials(data));

    const token = localStorage.getItem("token");
    fetch(`${BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.pontos_reputacao !== undefined)
          setReputation(data.pontos_reputacao);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <Navbar />
      <div className="profile-page">
        <div className="profile-card">
          <h1>{userName}</h1>
          <p>Universidade Federal</p>

          <hr />

          <h3>Estatísticas</h3>
          <p>Materiais cadastrados: {materials.length}</p>
          <p>Pontos de reputação: {reputation}</p>
        </div>
      </div>
    </>
  );
}
