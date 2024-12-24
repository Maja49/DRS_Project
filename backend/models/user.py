#kreiranje baze podadaka i definisanje korisnickog modela za SQLAlchemy
#ova klasa je povezana sa tabelom u bazi User

from . import db  # Import baze iz models/__init__.py

#model za korisnicke podatke u bazi
#klasa User nasljedjuje db.Model, znaci koristi SQLAlchemy za njeno mapiranje na tabelu u bazi
class User(db.Model):
    __tablename__ = 'User'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    lastname = db.Column(db.String(50), nullable=False)
    adress = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(50), nullable=False)
    country = db.Column(db.String(50), nullable=False)
    phone_number = db.Column(db.String(15))
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)  # Obična lozinka (ne šifrovana)
    username = db.Column(db.String(50), unique=True, nullable=False)
    is_admin = db.Column(db.Boolean, nullable=False)
    is_approved = db.Column(db.Boolean, default=False) 
    is_first_login = db.Column(db.Boolean, default=True) 
    
    # Promeni naziv backref-a na nešto drugo
    likes_dislikes = db.relationship('LikeDislike', back_populates='user', lazy=True)
    


