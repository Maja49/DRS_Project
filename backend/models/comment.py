from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Comment(db.Model):
    _tablename_ = 'comment'
    #id komentara
    id = db.Column(db.Integer, primary_key=True)
    #id usera
    idUser = db.Column(db.Integer)
    content = db.Column(db.String(500), nullable=False)
    idOfMentionUser = db.Column(db.Integer)

