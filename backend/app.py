from flask import Flask
from routes import auth_bp, admin_bp, theme_bp, discussion_bp, comment_bp, user_bp
from models import db
import config
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_socketio import SocketIO
from routes.email_sender import mail
import time
from sqlalchemy import text
import os

app = Flask(__name__)  # Inicijalizacija Flask aplikacije
app.config.from_pyfile('config.py')  # Učitaj konfiguraciju koja uključuje MAIL_* postavke
mail.init_app(app)

CORS(app, origins=["http://localhost:5173", "https://drs-frontend.onrender.com"])


# Konfiguracija baze
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{config.DB_USER}:{config.DB_PASSWORD}@{config.DB_HOST}:3306/{config.DB_NAME}"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = config.SECRET_KEY

print(f"Connecting to DB as: {config.DB_USER}, pass: {config.DB_PASSWORD}, host: {config.DB_HOST}, db: {config.DB_NAME}")



# inicijalizacija baze, povezuje SQLAlchemy sa flask aplikacijom, inicijalizuje se baza i omogucava aplikaciji da koristi SQLAlchemy za upravljanje podacima
#db je instanca SQLAlchemy koja omogucava komunikaciu sa bazom
db.init_app(app)

# registracija Blueprint-a
#ovaj blueprint ce se koristiti za login i registraciju, prefiks ce im biti /api/auth
app.register_blueprint(auth_bp, url_prefix='/api/auth')


# ruta za admina koji upravlja registracijama
app.register_blueprint(admin_bp, url_prefix='/api/admin')

#ruta za temu
app.register_blueprint(theme_bp, url_prefix='/api/theme')

# Registrovanje discussion Blueprint-a
app.register_blueprint(discussion_bp, url_prefix='/api/discussion')

# Registrovanje comment Blueprint-a
app.register_blueprint(comment_bp, url_prefix='/api/comment')  

# Registrovanje user Blueprint-a
app.register_blueprint(user_bp, url_prefix='/api/user')  


from sqlalchemy.exc import OperationalError

def wait_for_db():
    for i in range(30):  # do 30 pokušaja
        try:
            with app.app_context():
                with db.engine.connect() as conn:
                    conn.execute(text('SELECT 1'))
                    conn.commit()  # u nekim slučajevima može biti potrebno
            print("Database is up!")
            return
        except OperationalError:
            print(f"Database not ready, waiting... ({i+1}/30)")
            time.sleep(1)
    raise Exception("Could not connect to the database after 30 attempts")



if __name__ == '__main__':
    wait_for_db()  # čekaj da baza bude dostupna prije starta
    with app.app_context():
        db.create_all()
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

