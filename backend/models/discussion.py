from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Discussion(db.Model):
    _tablename_ = 'discussion'
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(500), nullable=False)
    theme = db.Column(db.String(255), nullable=False)
    like = db.Column(db.Integet)
    dislike = db.Column(db.Integet)
    comment = db.Column(db.String(500), nullable=False)
    idUser = db.Column(db.Integer)
    

    


