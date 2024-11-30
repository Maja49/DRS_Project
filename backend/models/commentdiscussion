from models import db


class CommentDiscussion(db.Model):
    __tablename__ = 'commentdiscussion'

    # Kolone
    comment_id = db.Column(db.Integer, db.ForeignKey('comment.id', ondelete='CASCADE'), primary_key=True)
    discussion_id = db.Column(db.Integer, db.ForeignKey('discussion.id', ondelete='CASCADE'), primary_key=True)

    def __repr__(self):
        return f'<CommentDiscussion Comment ID {self.comment_id}, Discussion ID {self.discussion_id}>'
