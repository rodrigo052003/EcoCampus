import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "./Notifications.css";

const BASE_URL = "http://127.0.0.1:5000";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        // Aceita array de objetos ou array de strings
        setNotifications(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="notifications-page">
        <h1>Notificações</h1>

        {loading ? (
          <p>Carregando...</p>
        ) : notifications.length === 0 ? (
          <p>Nenhuma notificação.</p>
        ) : (
          notifications.map((item, index) => (
            <div key={item.id || index} className="notification-item">
              {item.mensagem || item}
            </div>
          ))
        )}
      </div>
    </>
  );
}
