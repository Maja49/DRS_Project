from flask import request, jsonify, Blueprint
from models import db
from datetime import datetime, timezone
from sqlalchemy import or_
from models.discussion import Discussion
from models.theme import Theme
from models.user import User
from models.likeDislike import LikeDislike
from models.comment import Comment
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.token_utils import decode_token

discussion_bp = Blueprint('discussion', __name__)

# region get all
@discussion_bp.route('/get_all', methods=['GET'])
def get_all_discussions():
    try:
        # Query the database to get all discussions ordered by created_at from the oldest to the newest
        discussions = Discussion.query.order_by(Discussion.created_at.desc()).all()

        # Prepare the result data to return
        discussions_data = []
        for discussion in discussions:
            discussions_data.append({
                "id": discussion.id,
                "text": discussion.text,
                "title": discussion.title,
                "theme_name": discussion.theme.name,
                "user_id": discussion.user_id,  # Dodato
                "created_at": discussion.created_at.isoformat(),  # Convert to ISO format for better readability
                "updated_at": discussion.updated_at.isoformat() if discussion.updated_at else None,  # If updated_at is None, set to None
                "likes": discussion.likes,
                "dislikes": discussion.dislikes,
            })

        return jsonify({
            "message": "Discussions retrieved successfully",
            "discussions": discussions_data
        }), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500
# endregion 


# region all themes
# Ruta za dobijanje svih tema za popunjavanje padajućeg menija
@discussion_bp.route('/themes', methods=['GET'])
def get_all_themes():
    themes = Theme.query.all()
    if not themes:
        return jsonify({"message": "No themes available"}), 404
    
    return jsonify([
        {"id": theme.id, "name": theme.name, "description": theme.description}
        for theme in themes
    ]), 200
# endregion


# region create discussion
@discussion_bp.route('/create', methods=['POST'])
def create_discussion():
    token = request.headers.get('Authorization')

    if not token:
        return jsonify({"message": "Token is missing"}), 403

    token = token.split()[1]

    decoded = decode_token(token)
    if "error" in decoded:
        return jsonify({"message": decoded["error"]}), 403

    user_id = decoded.get('user_id')  # ID korisnika iz tokena
    if not user_id:
        return jsonify({"message": "User ID not found in token"}), 403

    data = request.get_json()
    text = data.get('text')
    title = data.get('title')
    theme_name = data.get('theme_name')  # Naziv teme iz padajućeg menija

    if not text or not theme_name or not title:
        return jsonify({"message": "Text, title and theme_name are required"}), 400

    # Pronalazak teme prema imenu
    theme = Theme.query.filter_by(name=theme_name).first()
    if not theme:
        return jsonify({"message": f"Theme with name '{theme_name}' not found"}), 404

    current_time = datetime.now(timezone.utc)
    # Kreiranje diskusije sa automatskim postavljanjem vremena
    new_discussion = Discussion(
        text=text,
        title=title,
        theme_id=theme.id,
        likes=0,
        dislikes=0,
        user_id=user_id,
        created_at=current_time,  # Postavljamo trenutni datum i vreme
        updated_at=None  # Inicijalno NULL
    )

    try:
        db.session.add(new_discussion)
        db.session.commit()
        return jsonify({
            "message": "Discussion created successfully",
            "discussion": {
                "id": new_discussion.id,
                "text": new_discussion.text,
                "title": new_discussion.title,
                "theme_name": theme.name,
                "user_id" : new_discussion.user_id, #Izmenjeno
                "created_at": new_discussion.created_at,
                "updated_at": new_discussion.updated_at
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500
# endregion


# region update discussion 
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
    title = data.get('title')

    if not text:
        return jsonify({"message": "Text is required"}), 400
    
    if not title:
        return jsonify({"message": "Title is required"}), 400
    
    current_time = datetime.now(timezone.utc)

    discussion.text = text  # Ažuriramo tekst diskusije
    discussion.title = title
    discussion.updated_at = current_time  # Postavljamo updated_at na trenutni datum i vreme

    try:
        db.session.commit()
        return jsonify({"message": "Discussion updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500
# endregion


# region delete discussion
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
# endregion   


# region like_dislike
@discussion_bp.route('/like_dislike/<int:discussion_id>', methods=['POST'])
def like_dislike_discussion(discussion_id):
    # Uzmi token iz Authorization zaglavlja
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

    # Preuzimanje podataka iz JSON zahteva
    data = request.get_json()
    action = data.get('action')  # Može biti "like" ili "dislike"

    # Proveri da li je akcija validna
    if action not in ['like', 'dislike']:
        return jsonify({"message": "Invalid action"}), 400

    # Pronađi diskusiju prema ID-u
    discussion = Discussion.query.get(discussion_id)
    if not discussion:
        return jsonify({"message": "Discussion not found"}), 404

    # Proveri da li je korisnik već lajkovao ili dislajkovao ovu diskusiju
    existing_entry = LikeDislike.query.filter_by(user_id=user_id, discussion_id=discussion_id).first()

    if existing_entry:
        # Ako korisnik želi da promeni akciju
        if existing_entry.action == action:
            return jsonify({"message": f"You have already {action}d this discussion"}), 400
        # Ažuriraj akciju ako je drugačija
        existing_entry.action = action
    else:
        # Ako korisnik još nije lajkovao/dislajkovao, napravi novi unos
        new_entry = LikeDislike(user_id=user_id, discussion_id=discussion_id, action=action)
        db.session.add(new_entry)

    # Ažuriraj broj lajkova i dislajkova za ovu diskusiju
    discussion.likes = LikeDislike.query.filter_by(discussion_id=discussion_id, action='like').count()
    discussion.dislikes = LikeDislike.query.filter_by(discussion_id=discussion_id, action='dislike').count()

    # Spremi promene u bazu
    try:
        db.session.commit()
        return jsonify({"message": f"Successfully {action}d the discussion"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500
# endregion


# region comment
@discussion_bp.route('/comment/<int:discussion_id>', methods=['POST'])
def comment_discussion(discussion_id):
    # Provera tokena iz Authorization zaglavlja
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"message": "Authorization token is missing"}), 401

    try:
        # Ekstrakcija tokena (uklanjanje "Bearer " prefiksa)
        token = token.split()[1]
    except IndexError:
        return jsonify({"message": "Invalid token format"}), 400

    # Validacija i dekodovanje tokena
    decoded = decode_token(token)
    if "error" in decoded:
        return jsonify({"message": decoded["error"]}), 403

    user_id = decoded.get('user_id')  # Izvlačenje ID korisnika iz tokena
    if not user_id:
        return jsonify({"message": "User ID not found in token"}), 403

    # Preuzimanje JSON podataka iz zahteva
    data = request.get_json()
    if not data:
        return jsonify({"message": "Invalid JSON data"}), 400

    text = data.get('text')
    mentioned_user_id = data.get('mentioned_user_id')  # Opcionalno

    # Validacija teksta komentara
    if not text or not text.strip():
        return jsonify({"message": "Text is required and cannot be empty"}), 400

    # Provera da li diskusija postoji
    discussion = Discussion.query.get(discussion_id)
    if not discussion:
        return jsonify({"message": "Discussion not found"}), 404

    # Kreiranje novog komentara
    new_comment = Comment(
        user_id=user_id,
        discussion_id=discussion_id,
        text=text.strip(),
        mentioned_user_id=mentioned_user_id
    )

    try:
        # Dodavanje komentara u bazu
        db.session.add(new_comment)
        db.session.commit()
        return jsonify({"message": "Comment added successfully"}), 201
    except Exception as e:
        # Povratak na prethodno stanje baze u slučaju greške
        db.session.rollback()
        return jsonify({"message": f"Database error: {str(e)}"}), 500
# endregion


# region search discussions
@discussion_bp.route('/search', methods=['GET'])
def search_discussions():
    # Uzimamo parametre pretrage iz query string-a
    theme_name = request.args.get('theme_name')
    user_name = request.args.get('name')
    user_lastname = request.args.get('lastname')
    user_address = request.args.get('address')
    user_email = request.args.get('email')
    
    # Kreiranje osnovnog upita
    query = db.session.query(Discussion).join(User, Discussion.user_id == User.id).join(Theme, Discussion.theme_id == Theme.id)

    # Dodavanje filtera za pretragu na osnovu prosleđenih parametara
    filters = []
    if theme_name:
        filters.append(Theme.name.ilike(f"%{theme_name}%"))
    if user_name:
        filters.append(User.name.ilike(f"%{user_name}%"))
    if user_lastname:
        filters.append(User.lastname.ilike(f"%{user_lastname}%"))
    if user_address:
        filters.append(User.adress.ilike(f"%{user_address}%"))
    if user_email:
        filters.append(User.email.ilike(f"%{user_email}%"))

    # Primena filtera ako postoje
    if filters:
        query = query.filter(or_(*filters))

    # Izvršavanje upita
    discussions = query.all()
    # Sortiranje
    discussions = query.order_by(Discussion.created_at.desc()).all()

    # Formatiranje rezultata u JSON odgovor
    results = []
    for discussion in discussions:
        results.append({
            "id": discussion.id,
            "text": discussion.text,
            "title": discussion.title,
            "theme": discussion.theme.name,
            "user": {
                "id": discussion.user_id,
                "name": User.query.get(discussion.user_id).name,
                "lastname": User.query.get(discussion.user_id).lastname,
                "email": User.query.get(discussion.user_id).email
            },
            "likes": discussion.likes,
            "dislikes": discussion.dislikes,
            "created_at": discussion.created_at  #Da bi upisalo vreme kako treba 

        })

    return jsonify(results), 200
# endregion

# region discussions by user -- dobijaju se sve diskusije odredjenog usera
@discussion_bp.route('/get_by_user/<int:user_id>', methods=['GET'])
def get_discussions_by_user(user_id):
    try:
        # Filter by user
        discussions = Discussion.query.filter_by(user_id=user_id).order_by(Discussion.created_at.desc()).all()
        
        discussions_data = []
        for discussion in discussions:
            discussions_data.append({
                "id": discussion.id,
                "text": discussion.text,
                "title": discussion.title,
                "theme_name": discussion.theme.name,
                "user_id": discussion.user_id,  
                "created_at": discussion.created_at.isoformat(),  # Convert to ISO format
                "updated_at": discussion.updated_at.isoformat() if discussion.updated_at else None,  # Handle None
                "likes": discussion.likes,
                "dislikes": discussion.dislikes,
            })

        return jsonify({
            "message": "Discussions retrieved successfully",
            "discussions": discussions_data
        }), 200

    except Exception as e:
        return jsonify({"message": str(e)}), 500
# endregion