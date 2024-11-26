from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Theme(db.Model):
    __tablename__ = 'Theme'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)

