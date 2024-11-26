from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Discussion(db.Model):
    __tablename__ = 'discussion'
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(500), nullable=False)
    theme = db.Column(db.String(255), nullable=False)
    likes = db.Column(db.Integer)
    dislike = db.Column(db.Integer)
    comment = db.Column(db.String(500), nullable=False)
    idUser = db.Column(db.Integer)


    


