from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Theme(db.Model):
    __tablename__ = 'theme'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False, unique=True)  # Naziv teme, mora biti jedinstven
    description = db.Column(db.Text, nullable=True)  # Opis teme, može biti prazan
