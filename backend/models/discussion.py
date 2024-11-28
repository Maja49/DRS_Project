from . import db  # Import baze iz models/__init__.py

class Discussion(db.Model):
    __tablename__ = 'discussion'

    # Kolone tabele
    id = db.Column(db.Integer, primary_key=True)  # Jedinstveni ID diskusije
    text = db.Column(db.Text, nullable=False)  # Tekst diskusije
    topic = db.Column(db.String(100), nullable=False)  # Tema diskusije
    likes = db.Column(db.Integer, default=0)  # Broj lajkova
    dislikes = db.Column(db.Integer, default=0)  # Broj dislajkova

    # Samo ID korisnika koji je kreirao diskusiju
    user_id = db.Column(db.Integer, nullable=False)  # ID korisnika

    def __repr__(self):
        return f'<Discussion {self.id}, User ID {self.user_id}>'