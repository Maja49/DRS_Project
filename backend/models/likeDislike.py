from sqlalchemy import Column, Integer, ForeignKey, Enum
from sqlalchemy.orm import relationship
from models import db

class LikeDislike(db.Model):
    __tablename__ = 'like_dislike'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('User.id', ondelete='CASCADE'), nullable=False)  # Ispravljeno na 'User.id'
    discussion_id = Column(Integer, ForeignKey('discussion.id', ondelete='CASCADE'), nullable=False)
    action = Column(Enum('like', 'dislike'), nullable=False)  # Enum za "like" ili "dislike"

    user = relationship('User', backref='likes_dislikes')
    discussion = relationship('Discussion', backref='likes_dislikes')
