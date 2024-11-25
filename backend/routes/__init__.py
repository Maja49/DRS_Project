from flask import Blueprint

# Ovo omogućava import Blueprint-ova iz modula
from .theme import theme_bp

# Lista Blueprint-ova koje registrujemo
__all__ = ['theme_bp']
