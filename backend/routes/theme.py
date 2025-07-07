from flask import Blueprint, request, jsonify
from models import db
from models.theme import Theme
from models.discussion import Discussion
from models.comment import Comment
from models.likeDislike import LikeDislike
from utils.token_utils import decode_token

theme_bp = Blueprint('theme', __name__)

# Dodavanje nove teme
@theme_bp.route('/create', methods=['POST', 'OPTIONS'])
def create_theme():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"message": "Token is missing"}), 403

    decoded = decode_token(token.split()[1])
    if "error" in decoded:
        return jsonify({"message": decoded["error"]}), 403

    if not decoded.get('is_admin'):
        return jsonify({"message": "Unauthorized. Only admins can create themes."}), 403

    data = request.json
    name = data.get('name')
    description = data.get('description')

    if not name:
        return jsonify({'message': 'Theme name is required.'}), 400

    if Theme.query.filter_by(name=name).first():
        return jsonify({'message': 'Theme with this name already exists.'}), 409

    new_theme = Theme(name=name, description=description)
    db.session.add(new_theme)
    db.session.commit()

    return jsonify({
        'message': 'Theme successfully created.',
        'theme': {
            'id': new_theme.id,
            'name': new_theme.name,
            'description': new_theme.description
        }
    }), 201

# Ažuriranje teme
@theme_bp.route('/update/<int:theme_id>', methods=['PUT', 'OPTIONS'])
def update_theme(theme_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"message": "Token is missing"}), 403

    decoded = decode_token(token.split()[1])
    if "error" in decoded:
        return jsonify({"message": decoded["error"]}), 403

    if not decoded.get('is_admin'):
        return jsonify({"message": "Unauthorized. Only admins can update themes."}), 403

    theme = Theme.query.get(theme_id)
    if not theme:
        return jsonify({"message": "Theme not found"}), 404

    data = request.json
    theme.name = data.get('name', theme.name)
    theme.description = data.get('description', theme.description)

    try:
        db.session.commit()
        return jsonify({"message": "Theme updated successfully."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error updating theme", "error": str(e)}), 500

# Brisanje teme
@theme_bp.route('/delete/<int:theme_id>', methods=['DELETE', 'OPTIONS'])
def delete_theme(theme_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"message": "Token is missing"}), 403

    decoded = decode_token(token.split()[1])
    if "error" in decoded:
        return jsonify({"message": decoded["error"]}), 403

    if not decoded.get('is_admin'):
        return jsonify({"message": "Unauthorized. Only admins can delete themes."}), 403

    try:
        # 1. Prvo dohvati sve diskusije koje pripadaju toj temi
        discussion_ids = [d.id for d in Discussion.query.filter_by(theme_id=theme_id).all()]

        if discussion_ids:
            # 2. Obriši komentare za sve diskusije te teme
            db.session.execute(
                Comment.__table__.delete().where(Comment.discussion_id.in_(discussion_ids))
            )

            # 3. Obriši lajkove/dislajkove za sve diskusije te teme
            db.session.execute(
                LikeDislike.__table__.delete().where(LikeDislike.discussion_id.in_(discussion_ids))
            )

            # 4. Obriši diskusije
            db.session.execute(
                Discussion.__table__.delete().where(Discussion.id.in_(discussion_ids))
            )

        # 5. Obriši temu
        db.session.execute(
            Theme.__table__.delete().where(Theme.id == theme_id)
        )

        db.session.commit()
        return jsonify({"message": "Theme and related data deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error deleting theme", "error": str(e)}), 500

# Lista svih tema
@theme_bp.route('/list', methods=['GET', 'OPTIONS'])
def list_themes():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    themes = Theme.query.all()
    return jsonify([
        {
            'id': theme.id,
            'name': theme.name,
            'description': theme.description
        }
        for theme in themes
    ])
