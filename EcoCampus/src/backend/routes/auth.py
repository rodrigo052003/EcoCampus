from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token

from config import get_db
from services.security import hash_password, verify_password

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():

    data     = request.json
    email    = data.get("email")
    password = data.get("password")

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT * FROM usuarios WHERE email = %s AND ativo = 1",
        (email,)
    )
    user = cursor.fetchone()

    cursor.close()
    conn.close()

    if not user or not verify_password(password, user["senha_hash"]):
        return jsonify({"message": "Credenciais inválidas"}), 401

    token = create_access_token(identity=str(user["id"]))

    return jsonify({
        "token": token,
        "name":  user["nome"],
        "id":    user["id"]
    })


@auth_bp.route("/register", methods=["POST"])
def register():

    data  = request.json
    nome  = data.get("name")
    email = data.get("email")
    senha = data.get("password")
    tipo  = data.get("role", "Aluno")   # "Aluno" ou "Professor"

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)

    # Verifica se e-mail já existe
    cursor.execute(
        "SELECT id FROM usuarios WHERE email = %s",
        (email,)
    )
    if cursor.fetchone():
        cursor.close()
        conn.close()
        return jsonify({"message": "Email já cadastrado"}), 400

    cursor.execute(
        """
        INSERT INTO usuarios (nome, email, senha_hash, tipo)
        VALUES (%s, %s, %s, %s)
        """,
        (nome, email, hash_password(senha), tipo)
    )
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({"message": "Usuário criado"}), 201
