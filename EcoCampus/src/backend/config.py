import mysql.connector

DB_CONFIG = {
    "host":     "127.0.0.1",
    "port":     3307,
    "user":     "root",
    "password": "",          
    "database": "ecocampus"
}

JWT_SECRET_KEY = "ecocampus-secret"

def get_db():
    conn = mysql.connector.connect(**DB_CONFIG)
    return conn
