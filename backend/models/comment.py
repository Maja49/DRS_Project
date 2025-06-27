from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from models import db
from models.user import User

class Comment(db.Model):
    __tablename__ = 'comment'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('User.id'), nullable=False)  # Obavezno
    discussion_id = Column(Integer, ForeignKey('discussion.id'), nullable=False)  # Povezivanje sa diskusijama
    text = Column(String(255), nullable=False)
    mentioned_user_id = Column(Integer, ForeignKey('User.id'), nullable=True)  # Opcionalno

    # Relationships
    user = relationship('User', backref='comment', foreign_keys=[user_id])
    discussion = relationship('Discussion', backref='comment')  # Veza sa Discussion modelom
    mentioned_user = relationship('User', foreign_keys=[mentioned_user_id], backref='mentioned_comments')
    
    def __init__(self, user_id, discussion_id, text, mentioned_user_id=None):
        self.user_id = user_id
        self.discussion_id = discussion_id
        self.text = text
        self.mentioned_user_id = mentioned_user_id

    def __repr__(self):        return f'<Comment {self.id}, User {self.user_id}, Mentioned User {self.mentioned_user_id}>'

