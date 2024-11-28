from flask import Blueprint, request, jsonify
from models import db  # Pretpostavlja se da `db` dolazi iz models/__init__.py
from models.discussion import Discussion
from models.theme import Theme
from utils.token_utils import decode_token

discussion_bp = Blueprint("discussion", __name__)

# Ruta za kreiranje diskusije
@discussion_bp.route("/create", methods=["POST"])
def create_discussion():
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"message": "Token is missing"}), 401

    decoded = decode_token(token.split("Bearer ")[-1])
    if "error" in decoded:
        return jsonify({"message": decoded["error"]}), 401

    data = request.json

    # Validacija teme: Pretražujemo tabelu Theme da proverimo da li postoji tema sa prosleđenim imenom
    theme_name = data.get("theme")
    theme = Theme.query.filter_by(name=theme_name).first()  # Proverava se da li tema postoji
    if not theme:
        return jsonify({"message": "Invalid theme"}), 400  # Ako tema nije pronađena, vraćamo grešku

    new_discussion = Discussion(
        text=data.get("text"),
        theme=theme_name,
        likes=0,
        dislikes=0,
        user_id=decoded["user_id"],
    )
    db.session.add(new_discussion)
    db.session.commit()

    return jsonify({"message": "Discussion created successfully"}), 201

# Ruta za brisanje diskusije
@discussion_bp.route("/<int:discussion_id>", methods=["DELETE"])
def delete_discussion(discussion_id):
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"message": "Token is missing"}), 401

    decoded = decode_token(token.split("Bearer ")[-1])
    if "error" in decoded:
        return jsonify({"message": decoded["error"]}), 401

    discussion = Discussion.query.get(discussion_id)

    if not discussion:
        return jsonify({"message": "Discussion not found"}), 404

    # Provera prava pristupa
    if not decoded["is_admin"] and discussion.user_id != decoded["user_id"]:
        return jsonify({"message": "Access denied"}), 403

    db.session.delete(discussion)
    db.session.commit()

    return jsonify({"message": "Discussion deleted successfully"}), 200


# Ruta za izmenu diskusije
@discussion_bp.route("/<int:discussion_id>", methods=["PUT"])
def update_discussion(discussion_id):
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"message": "Token is missing"}), 401

    decoded = decode_token(token.split("Bearer ")[-1])
    if "error" in decoded:
        return jsonify({"message": decoded["error"]}), 401

    discussion = Discussion.query.get(discussion_id)
    if not discussion:
        return jsonify({"message": "Discussion not found"}), 404

    # Provera prava pristupa
    if not decoded["is_admin"] and discussion.user_id != decoded["user_id"]:
        return jsonify({"message": "Access denied"}), 403

    data = request.json

    # Validacija teme
    theme_name = data.get("theme")
    theme = Theme.query.filter_by(name=theme_name).first()
    if not theme:
        return jsonify({"message": "Invalid theme"}), 400

    # Ažuriranje diskusije
    discussion.text = data.get("text")
    discussion.theme = theme_name
    db.session.commit()

    return jsonify({"message": "Discussion updated successfully"}), 200


# Ruta za preuzimanje svih tema
@discussion_bp.route("/themes", methods=["GET"])
def get_all_themes():
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"message": "Token is missing"}), 401

    decoded = decode_token(token.split("Bearer ")[-1])
    if "error" in decoded:
        return jsonify({"message": decoded["error"]}), 401

    themes = Theme.query.all()
    theme_list = [theme.name for theme in themes]
    return jsonify({"themes": theme_list}), 200
