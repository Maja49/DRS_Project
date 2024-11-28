from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from models import db
from models.user import User
from models.post import Post  # Pretpostavljamo da postoji model Post za objave

class Comment(db.Model):
    __tablename__ = 'comments'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)  # Obavezno
    post_id = Column(Integer, ForeignKey('posts.id'), nullable=False)
    text = Column(String, nullable=False)
    mentioned_user_id = Column(Integer, ForeignKey('users.id'), nullable=True)  # Opcionalno

    # Relationships
    user = relationship('User', backref='comments')
    post = relationship('Post', backref='comments')
    mentioned_user = relationship('User', foreign_keys=[mentioned_user_id], backref='mentioned_comments')
    
    def __init__(self, user_id, post_id, text, mentioned_user_id=None):
        self.user_id = user_id
        self.post_id = post_id
        self.text = text
        self.mentioned_user_id = mentioned_user_id

    def __repr__(self):
        return f'<Comment {self.id}, User {self.user_id}, Post {self.post_id}, Mentioned User {self.mentioned_user_id}>'
