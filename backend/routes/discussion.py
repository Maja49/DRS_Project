from flask import request, jsonify, Blueprint
from models import db
from models.discussion import Discussion
from models.theme import Theme
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.token_utils import decode_token

discussion_bp = Blueprint('discussion', __name__)


@discussion_bp.route('/create', methods=['POST'])
def create_discussion():
    token = request.headers.get('Authorization')

    if not token:
        return jsonify({"message": "Token is missing"}), 403
    
    # Uklanjamo 'Bearer ' deo iz tokena i uzimamo samo token
    token = token.split()[1]

    # Validacija tokena, ekstraktujemo korisnički ID
    decoded = decode_token(token)
    if "error" in decoded:
        return jsonify({"message": decoded["error"]}), 403

    user_id = decoded.get('user_id')  # Dobijamo ID korisnika iz tokena
    if not user_id:
        return jsonify({"message": "User ID not found in token"}), 403

    # Uzimamo podatke za diskusiju iz JSON tela zahteva
    data = request.get_json()
    text = data.get('text')
    theme_name = data.get('theme_name')  # Koristimo ime teme umesto ID-a

    if not text or not theme_name:
        return jsonify({"message": "Text and theme_name are required"}), 400

    # Pronalazimo temu po imenu
    theme = Theme.query.filter_by(name=theme_name).first()
    
    if not theme:
        return jsonify({"message": f"Theme with name '{theme_name}' not found"}), 404

    # Kreiramo novu diskusiju sa user_id i theme_id (ID teme koju smo pronašli)
    new_discussion = Discussion(
        text=text,
        theme_id=theme.id,  # Koristimo ID teme
        likes=0,  # Početni broj lajkova
        dislikes=0,  # Početni broj dislajkova
        user_id=user_id  # Povezivanje diskusije sa trenutnim korisnikom
    )

    # Spasavanje diskusije u bazi podataka
    try:
        db.session.add(new_discussion)
        db.session.commit()
        return jsonify({"message": "Discussion created successfully", "discussion_id": new_discussion.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500
    
    
@discussion_bp.route('/update/<int:discussion_id>', methods=['PUT'])
def update_discussion(discussion_id):
    token = request.headers.get('Authorization')

    if not token:
        return jsonify({"message": "Token is missing"}), 403

    token = token.split()[1]  # Uklanjamo 'Bearer ' i uzimamo samo token

    decoded = decode_token(token)
    if "error" in decoded:
        return jsonify({"message": decoded["error"]}), 403

    user_id = decoded.get('user_id')
    is_admin = decoded.get('is_admin')
    
    if not user_id:
        return jsonify({"message": "User ID not found in token"}), 403

    # Pronalazimo diskusiju prema ID-u
    discussion = Discussion.query.get(discussion_id)
    if not discussion:
        return jsonify({"message": "Discussion not found"}), 404

    # Provjeravamo da li je korisnik autor diskusije ili admin
    if discussion.user_id != user_id and not is_admin:
        return jsonify({"message": "You are not authorized to update this discussion"}), 403

    # Ako je sve u redu, ažuriramo diskusiju
    data = request.get_json()
    text = data.get('text')

    if not text:
        return jsonify({"message": "Text is required"}), 400

    discussion.text = text  # Ažuriramo tekst diskusije

    try:
        db.session.commit()
        return jsonify({"message": "Discussion updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

@discussion_bp.route('/delete/<int:discussion_id>', methods=['DELETE'])
def delete_discussion(discussion_id):
    token = request.headers.get('Authorization')

    if not token:
        return jsonify({"message": "Token is missing"}), 403

    token = token.split()[1]  # Uklanjamo 'Bearer ' i uzimamo samo token

    decoded = decode_token(token)
    if "error" in decoded:
        return jsonify({"message": decoded["error"]}), 403

    user_id = decoded.get('user_id')
    is_admin = decoded.get('is_admin')
    
    if not user_id:
        return jsonify({"message": "User ID not found in token"}), 403

    # Pronalazimo diskusiju prema ID-u
    discussion = Discussion.query.get(discussion_id)
    if not discussion:
        return jsonify({"message": "Discussion not found"}), 404

    # Provjeravamo da li je korisnik autor diskusije ili admin
    if discussion.user_id != user_id and not is_admin:
        return jsonify({"message": "You are not authorized to delete this discussion"}), 403

    # Ako je sve u redu, brišemo diskusiju
    try:
        db.session.delete(discussion)
        db.session.commit()
        return jsonify({"message": "Discussion deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500
