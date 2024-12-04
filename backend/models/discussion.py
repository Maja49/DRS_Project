from datetime import datetime, timezone
from . import db  # Import baze iz models/__init__.py
from sqlalchemy.orm import relationship

class Discussion(db.Model):
    __tablename__ = 'discussion'

    id = db.Column(db.Integer, primary_key=True)  # Jedinstveni ID diskusije
    text = db.Column(db.Text, nullable=False)  # Tekst diskusije
    theme_id = db.Column(db.Integer, db.ForeignKey('theme.id'), nullable=False)  # Tema diskusije povezano sa id iz tabele Theme
    likes = db.Column(db.Integer, default=0)  # Broj lajkova
    dislikes = db.Column(db.Integer, default=0)  # Broj dislajkova
    user_id = db.Column(db.Integer, nullable=False)  # ID korisnika koji je kreirao diskusiju

    # Timestamps
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))  # Automatically sets creation time in UTC
    updated_at = db.Column(db.DateTime, default=None, onupdate=lambda: datetime.now(timezone.utc))  # Initially None, updated on change



    # Definisanje odnosa sa tabelom Theme
    theme = db.relationship('Theme', backref=db.backref('discussions', lazy=True))
    likes_dislikes = relationship('LikeDislike', back_populates='discussion', lazy='dynamic')

    def __repr__(self):
        return f'<Discussion {self.id}, User ID {self.user_id}, Theme {self.theme.name}>'
