from sqlalchemy import Column, Integer, ForeignKey, Enum
from sqlalchemy.orm import relationship
from models import db

class LikeDislike(db.Model):
    __tablename__ = 'like_dislike'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('User.id', ondelete='CASCADE'), nullable=False)  # Ispravljeno na 'User.id'
    discussion_id = Column(Integer, ForeignKey('discussion.id', ondelete='CASCADE'), nullable=False)
    action = Column(Enum('like', 'dislike', name='like_dislike_enum'), nullable=False)  # Enum za "like" ili "dislike"

    user = db.relationship('User', back_populates='likes_dislikes')
    discussion = db.relationship('Discussion', back_populates='likes_dislikes')