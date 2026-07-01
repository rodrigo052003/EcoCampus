from datetime import timedelta

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, decode_token
from flask_mail import Mail, Message
from jwt.exceptions import PyJWTError

from config import get_db
from services.security import hash_password, verify_password

auth_bp = Blueprint("auth", __name__)
RESET_TOKEN_TYPE = "password_reset"


@auth_bp.route("/login", methods=["POST"])
def login():
    data     = request.json
    email    = data.get("email")
    password = data.get("password")

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM usuarios WHERE email = %s AND ativo = 1", (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if not user or not verify_password(password, user["senha_hash"]):
        return jsonify({"message": "Credenciais inválidas"}), 401

    token = create_access_token(identity=str(user["id"]))
    return jsonify({"token": token, "name": user["nome"], "id": user["id"]})


@auth_bp.route("/register", methods=["POST"])
def register():
    data  = request.json
    nome  = data.get("name")
    email = data.get("email")
    senha = data.get("password")
    tipo  = data.get("role", "Aluno")

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id FROM usuarios WHERE email = %s", (email,))
    if cursor.fetchone():
        cursor.close()
        conn.close()
        return jsonify({"message": "Email já cadastrado"}), 400

    cursor.execute(
        "INSERT INTO usuarios (nome, email, senha_hash, tipo) VALUES (%s, %s, %s, %s)",
        (nome, email, hash_password(senha), tipo)
    )
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Usuário criado"}), 201


@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data  = request.json or {}
    email = data.get("email")

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, nome FROM usuarios WHERE email = %s AND ativo = 1", (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    # Não revela se o e-mail existe ou não
    if not user:
        return jsonify({"message": "Se o e-mail existir, você receberá as instruções em breve."})

    reset_token = create_access_token(
        identity=str(user["id"]),
        expires_delta=timedelta(minutes=30),
        additional_claims={"type": RESET_TOKEN_TYPE},
    )

    # Monta e envia o e-mail
    mail = Mail(current_app)
    msg  = Message(
        subject="EcoCampus — Redefinição de senha",
        recipients=[email],
    )
    msg.html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;
                border-radius:16px;background:#f8fafc;border:1px solid #e2e8f0">
      <h2 style="color:#2563eb;margin-bottom:8px">🌱 EcoCampus</h2>
      <h3 style="margin-bottom:16px">Redefinição de senha</h3>
      <p>Olá, <strong>{user['nome']}</strong>!</p>
      <p>Recebemos um pedido para redefinir a senha da sua conta.
         Use o código abaixo na tela de redefinição de senha:</p>
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;
                  padding:16px;margin:24px 0;word-break:break-all;font-size:13px;
                  color:#334155">
        {reset_token}
      </div>
      <p style="color:#64748b;font-size:13px">
        Este código expira em <strong>30 minutos</strong>.<br>
        Se você não solicitou a redefinição, ignore este e-mail.
      </p>
    </div>
    """

    try:
        mail.send(msg)
    except Exception as e:
        current_app.logger.error(f"Erro ao enviar e-mail: {e}")
        return jsonify({"message": "Erro ao enviar e-mail. Tente novamente."}), 500

    return jsonify({"message": "Instruções enviadas para o seu e-mail."})


@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data        = request.json or {}
    reset_token = data.get("reset_token")
    nova_senha  = data.get("password")

    if not reset_token or not nova_senha:
        return jsonify({"message": "Dados incompletos"}), 400

    try:
        decoded = decode_token(reset_token)
    except Exception:
        return jsonify({"message": "Token inválido ou expirado"}), 401

    if decoded.get("type") != RESET_TOKEN_TYPE:
        return jsonify({"message": "Token inválido"}), 401

    user_id = decoded.get("sub")

    conn   = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE usuarios SET senha_hash = %s WHERE id = %s",
        (hash_password(nova_senha), user_id)
    )
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Senha redefinida com sucesso"})