from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from config import get_db

requests_bp = Blueprint("requests", __name__)


@requests_bp.route("/requests", methods=["GET"])
@jwt_required()
def get_requests():
    """Lista as solicitações do usuário logado."""

    user_id = int(get_jwt_identity())

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT s.id, m.titulo AS material,
               u.nome AS owner, s.tipo AS type,
               s.status, s.mensagem AS message,
               s.criado_em AS created_at
        FROM   solicitacoes s
        JOIN   materiais    m ON m.id = s.material_id
        JOIN   usuarios     u ON u.id = m.usuario_id
        WHERE  s.solicitante_id = %s
        ORDER  BY s.criado_em DESC
        """,
        (user_id,)
    )
    solicitacoes = cursor.fetchall()

    cursor.close()
    conn.close()

    # Converte datetime para string
    for s in solicitacoes:
        if s.get("created_at"):
            s["created_at"] = str(s["created_at"])

    return jsonify(solicitacoes)


@requests_bp.route("/requests/received", methods=["GET"])
@jwt_required()
def get_received_requests():
    """Lista solicitações recebidas pelo usuário logado (dono dos materiais)."""

    user_id = int(get_jwt_identity())

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT s.id, m.titulo AS material,
               u.nome AS requester, s.tipo AS type,
               s.status, s.mensagem AS message,
               s.criado_em AS created_at
        FROM   solicitacoes s
        JOIN   materiais    m ON m.id  = s.material_id
        JOIN   usuarios     u ON u.id  = s.solicitante_id
        WHERE  m.usuario_id = %s
        ORDER  BY s.criado_em DESC
        """,
        (user_id,)
    )
    solicitacoes = cursor.fetchall()

    cursor.close()
    conn.close()

    for s in solicitacoes:
        if s.get("created_at"):
            s["created_at"] = str(s["created_at"])

    return jsonify(solicitacoes)


@requests_bp.route("/requests", methods=["POST"])
@jwt_required()
def create_request():
    """Cria uma nova solicitação para um material."""

    user_id = int(get_jwt_identity())
    data    = request.json

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        INSERT INTO solicitacoes
            (material_id, solicitante_id, tipo, mensagem)
        VALUES (%s, %s, %s, %s)
        """,
        (
            data.get("material_id"),
            user_id,
            data.get("type", "Troca"),
            data.get("message", "")
        )
    )
    conn.commit()
    new_id = cursor.lastrowid

    cursor.close()
    conn.close()

    return jsonify({"id": new_id, "message": "Solicitação criada", "status": "Pendente"}), 201


@requests_bp.route("/requests/<int:id>", methods=["PUT"])
@jwt_required()
def update_request(id):
    """Atualiza o status de uma solicitação (Aceita, Recusada, Finalizada)."""

    data   = request.json
    status = data.get("status")

    conn   = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE solicitacoes SET status = %s WHERE id = %s",
        (status, id)
    )
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({"message": "Solicitação atualizada", "status": status})
