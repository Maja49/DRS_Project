from flask import Blueprint, request, jsonify
from models.theme import Theme, db
from utils.token_utils import decode_token  # Import funkcije za validaciju tokena

theme_bp = Blueprint('theme', __name__)

@theme_bp.route('/resi', methods=['GET'])
def create_theme():
    return jsonify({'message': 'Theme route working!'}), 200

@theme_bp.route('/createee', methods=['POST'])
def create_theme():
    # Provera tokena
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"message": "Token is missing"}), 403

    # Validacija tokena
    decoded = decode_token(token.split()[1])
    if "error" in decoded:
        return jsonify({"message": decoded["error"]}), 403

    # Provera admin privilegija
    if not decoded.get('is_admin'):
        return jsonify({"message": "Unauthorized. Only admins can create themes."}), 403

    # Preuzimanje podataka iz zahteva
    data = request.json
    name = data.get('name')
    description = data.get('description')

    if not name:
        return jsonify({'message': 'Theme name is required.'}), 400

    # Proveri da li tema sa istim imenom već postoji
    if Theme.query.filter_by(name=name).first():
        return jsonify({'message': 'Theme with this name already exists.'}), 409

    # Dodaj novu temu
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
