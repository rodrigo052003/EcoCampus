from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from config import get_db

materials_bp = Blueprint("materials", __name__)


@materials_bp.route("/materials", methods=["GET"])
def get_materials():
    """Lista todos os materiais disponíveis (marketplace)."""

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT m.id, m.titulo AS title, m.descricao AS description,
               m.categoria AS category, m.qualidade AS quality,
               m.tipo_transacao AS transaction, m.status,
               u.nome AS owner, u.id AS owner_id
        FROM   materiais m
        JOIN   usuarios  u ON u.id = m.usuario_id
        ORDER  BY m.criado_em DESC
        """
    )
    materiais = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(materiais)


@materials_bp.route("/materials/me", methods=["GET"])
@jwt_required()
def get_my_materials():
    """Lista os materiais do usuário logado."""

    user_id = int(get_jwt_identity())

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT id, titulo AS title, descricao AS description,
               categoria AS category, qualidade AS quality,
               tipo_transacao AS transaction, status
        FROM   materiais
        WHERE  usuario_id = %s
        ORDER  BY criado_em DESC
        """,
        (user_id,)
    )
    materiais = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(materiais)


@materials_bp.route("/materials/<int:id>", methods=["GET"])
def get_material(id):
    """Retorna detalhes de um material específico."""

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT m.id, m.titulo AS title, m.descricao AS description,
               m.categoria AS category, m.qualidade AS quality,
               m.tipo_transacao AS transaction, m.status,
               u.nome AS owner, u.id AS owner_id
        FROM   materiais m
        JOIN   usuarios  u ON u.id = m.usuario_id
        WHERE  m.id = %s
        """,
        (id,)
    )
    material = cursor.fetchone()

    cursor.close()
    conn.close()

    if not material:
        return jsonify({"message": "Material não encontrado"}), 404

    return jsonify(material)


@materials_bp.route("/materials", methods=["POST"])
@jwt_required()
def create_material():
    """Cadastra um novo material."""

    user_id = int(get_jwt_identity())
    data    = request.json

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        INSERT INTO materiais
            (usuario_id, titulo, descricao, categoria, qualidade, tipo_transacao)
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (
            user_id,
            data.get("title"),
            data.get("description", ""),
            data.get("category"),
            data.get("quality"),
            data.get("transaction")
        )
    )
    conn.commit()
    new_id = cursor.lastrowid

    cursor.close()
    conn.close()

    return jsonify({"id": new_id, "message": "Material cadastrado"}), 201


@materials_bp.route("/materials/<int:id>", methods=["PUT"])
@jwt_required()
def update_material(id):
    """Edita um material do usuário logado."""

    user_id = int(get_jwt_identity())
    data    = request.json

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        UPDATE materiais
        SET    titulo         = %s,
               descricao      = %s,
               categoria      = %s,
               qualidade      = %s,
               tipo_transacao = %s
        WHERE  id = %s AND usuario_id = %s
        """,
        (
            data.get("title"),
            data.get("description", ""),
            data.get("category"),
            data.get("quality"),
            data.get("transaction"),
            id,
            user_id
        )
    )
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({"message": "Material atualizado"})


@materials_bp.route("/materials/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_material(id):
    """Remove um material do usuário logado."""

    user_id = int(get_jwt_identity())

    conn   = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM materiais WHERE id = %s AND usuario_id = %s",
        (id, user_id)
    )
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({"message": "Material removido"})


@materials_bp.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    return jsonify({"message": "Token válido"})
