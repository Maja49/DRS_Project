from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Registruj modele ovde ako ih imaš više
from .theme import Theme
from .user import User  # Primer, ako koristiš korisnike
