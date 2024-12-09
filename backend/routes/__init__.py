from .comment import comment_bp
from .discussion import discussion_bp
from .theme import theme_bp
from .auth import auth_bp
from .admin import admin_bp
from .user import user_bp

__all__ = ['comment_bp', 'discussion_bp','theme_bp', 'auth_bp', 'admin_bp', 'user_bp']
