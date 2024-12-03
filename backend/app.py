from flask import Flask
from routes import auth_bp, admin_bp, theme_bp, discussion_bp, comment_bp
from models import db
import config

app = Flask(__name__) #inicijalizacija flask aplikacije

# konfiguracija baze
#uverivanje URL veze sa bazom = specifikacija za povezivanje baze pomocu pymsql drivera, ostali parametri su preuzeti iz configa
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{config.DB_USER}:{config.DB_PASSWORD}@{config.DB_HOST}/{config.DB_NAME}"
#ovaj URL omogućava SQLAlchemy da se poveže sa bazom podataka pomoću MySQL-a i pymysql drajvera
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
#neophodan kljuc za obezbjedjivanje sesije u flask aplikaciji
app.secret_key = config.SECRET_KEY

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


if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # kreira tabele u bazi ako ne postoje
                         #provjerava sve modele iz aplikacije i na osnovu nih kreira odgovarajuce tabele u bazi, ako ne postoji
    app.run(debug=True)  #pokretanje aplikacije