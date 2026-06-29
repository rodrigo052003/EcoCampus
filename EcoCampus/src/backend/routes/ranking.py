from flask import Blueprint, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from config import get_db

ranking_bp = Blueprint("ranking", __name__)


def get_nivel(pontos):
    if pontos >= 500:
        return {"nivel": "Lendário",    "badge": "🏆", "cor": "#f59e0b"}
    elif pontos >= 200:
        return {"nivel": "Expert",      "badge": "💎", "cor": "#6366f1"}
    elif pontos >= 100:
        return {"nivel": "Colaborador", "badge": "⭐", "cor": "#10b981"}
    elif pontos >= 30:
        return {"nivel": "Ativo",       "badge": "🔥", "cor": "#f97316"}
    else:
        return {"nivel": "Iniciante",   "badge": "🌱", "cor": "#64748b"}


@ranking_bp.route("/ranking", methods=["GET"])
def get_ranking():
    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT id, nome AS name, pontos_reputacao AS points,
               universidade AS university
        FROM   usuarios
        WHERE  ativo = 1
        ORDER  BY pontos_reputacao DESC
        LIMIT  50
    """)
    users = cursor.fetchall()
    cursor.close()
    conn.close()

    ranking = []
    for i, user in enumerate(users):
        nivel_info = get_nivel(user["points"])
        ranking.append({
            "position":   i + 1,
            "id":         user["id"],
            "name":       user["name"],
            "points":     user["points"],
            "university": user["university"] or "—",
            **nivel_info
        })
    return jsonify(ranking)


@ranking_bp.route("/ranking/me", methods=["GET"])
def get_my_position():
    try:
        verify_jwt_in_request()
        user_id = int(get_jwt_identity())
    except Exception:
        return jsonify({"message": "Token inválido"}), 401

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT COUNT(*) + 1 AS posicao
        FROM   usuarios
        WHERE  pontos_reputacao > (
            SELECT pontos_reputacao FROM usuarios WHERE id = %s
        ) AND ativo = 1
    """, (user_id,))
    pos = cursor.fetchone()

    cursor.execute(
        "SELECT pontos_reputacao AS points, nome AS name FROM usuarios WHERE id = %s",
        (user_id,)
    )
    me = cursor.fetchone()
    cursor.close()
    conn.close()

    nivel_info = get_nivel(me["points"])
    return jsonify({
        "position": pos["posicao"],
        "points":   me["points"],
        "name":     me["name"],
        **nivel_info
    })
