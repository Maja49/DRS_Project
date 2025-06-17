from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User 
from .likeDislike import LikeDislike
from .discussion import Discussion
from .theme import Theme
from .comment import Comment
