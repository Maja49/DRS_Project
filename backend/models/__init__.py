from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User  # Primer, ako koristiš korisnike
from .likeDislike import LikeDislike
from .discussion import Discussion
# Registruj modele ovde ako ih imaš više
from .theme import Theme
from .comment import Comment
