from . import db  # Import baze iz models/__init__.py

class Theme(db.Model):
    __tablename__ = 'theme'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False, unique=True)  # Naziv teme
    description = db.Column(db.Text, nullable=True)  # Opis teme
