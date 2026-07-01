import mysql.connector

DB_CONFIG = {
    "host":     "127.0.0.1",
    "port":     3307,
    "user":     "root",
    "password": "",
    "database": "ecocampus"
}

JWT_SECRET_KEY = "ecocampus-secret"

# ── Configurações de e-mail (Gmail) ──────────────────────────
MAIL_SERVER   = "smtp.gmail.com"
MAIL_PORT     = 587
MAIL_USE_TLS  = True
MAIL_USERNAME = "rodrigozinho06@gmail.com"
MAIL_PASSWORD = "nntk eeop dipa xqeh"
MAIL_DEFAULT_SENDER = ("EcoCampus", "rodrigozinho06@gmail.com")

def get_db():
    conn = mysql.connector.connect(**DB_CONFIG)
    return conn