from flask import Blueprint, request, jsonify
from models import db
from models.theme import Theme
from models.user import User
from models.discussion import Discussion
from models.comment import Comment
from models.likeDislike import LikeDislike
from utils.token_utils import decode_token
import traceback
from .email_sender import send_email
import logging


admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    # Provjera da li admin ima token (stavlja se u header authorization)
    def wrapper(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"message": "Token is missing"}), 403
        
        # Validacija tokena, ako vrati grešku, token nije ispravan
        decoded = decode_token(token.split()[1])
        if "error" in decoded:
            return jsonify({"message": decoded["error"]}), 403

        # Provjera korisnikovog polja is_admin, ako je 1 onda je admin, ako ne nema pravo pristupa
        if not decoded.get("is_admin"):
            return jsonify({"message": "Admin access required"}), 403
        
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

# Admin vidi sve zahtjeve za registraciju
@admin_bp.route('/registration-requests', methods=['GET', 'OPTIONS'])
@admin_required
def get_registration_requests():
    # Prikaz svih korisnika koji čekaju odobrenje (polje is_approved im je još uvijek false)
    pending_users = User.query.filter_by(is_approved=False).all()
    return jsonify([{
        'id': user.id,
        'name': user.name,
        'lastname': user.lastname,
        'email': user.email,
        'username': user.username,
        # Naredna dva polja su tu za bolji prikaz zahtjeva, kao dugmadi accept i reject
        'accept_url': f'/api/admin/registration-requests/accept/{user.id}',
        'reject_url': f'/api/admin/registration-requests/reject/{user.id}'
    } for user in pending_users])

# Prihvatanje korisnikovog zahtjeva za registraciju
@admin_bp.route('/registration-requests/accept/<int:user_id>', methods=['PUT', 'OPTIONS'])
@admin_required
def accept_registration_request(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    # Azuriranje is_approved na true
    user.is_approved = True
    try:
        db.session.commit()

        # Slanje email-a korisniku da je registracija prihvaćena
        subject = "Registration Accepted"
        body = f"Dear {user.name} {user.lastname},\n\nYour registration has been successfully accepted. You can now log in to your account."
        send_email(subject, [user.email], body)
        
        return jsonify({"message": "User registration accepted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "message": "Error accepting registration",
            "error": str(e)
        }), 500

@admin_bp.route('/registration-requests/reject/<int:user_id>', methods=['DELETE', 'OPTIONS'])
@admin_required
def reject_registration_request(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    # Brisanje korisnika iz baze
    try:
        db.session.delete(user)
        db.session.commit()

        # Slanje email-a korisniku da je registracija odbijena
        subject = "Registration Rejected"
        body = f"Dear {user.name} {user.lastname},\n\nWe regret to inform you that your registration has been rejected."
        send_email(subject, [user.email], body)
        
        return jsonify({"message": "User registration rejected and user deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "message": "Error rejecting registration",
            "error": str(e)
        }), 500


# region preuzimanje svih korisnika
# Ruta za preuzimanje svih korisnika
@admin_bp.route('/users', methods=['GET', 'OPTIONS'])
def get_all_users():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"message": "Token is missing"}), 403

    # Validacija tokena
    decoded = decode_token(token.split()[1])
    if "error" in decoded:
        return jsonify({"message": decoded["error"]}), 403

    # Provera administratorskog pristupa
    is_admin = decoded.get("is_admin")
    if not is_admin:
        return jsonify({"message": "Unauthorized: Admin privileges required"}), 403

    # Preuzimanje svih korisnika iz baze
    users = User.query.filter_by(is_approved=True, is_admin=False).all()
    users_list = [
        {
            "id": user.id,
            "name": user.name,
            "lastname": user.lastname,
            "adress": user.adress,
            "city": user.city,
            "country": user.country,
            "phone_number": user.phone_number,
            "email": user.email,
            "username": user.username,
            "is_admin": user.is_admin,
        }
        for user in users
    ]

    return jsonify({"users": users_list}), 200
# endregion

# Lista svih tema
@admin_bp.route('/theme-list', methods=['GET', 'OPTIONS'])
def list_themes():
    themes = Theme.query.all()
    return jsonify([
        {
            'id': theme.id,
            'name': theme.name,
            'description': theme.description
        }
        for theme in themes
    ])
    
    # Dodavanje nove teme
@admin_bp.route('/theme-create', methods=['POST', 'OPTIONS'])
def create_theme():
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


# Brisanje teme

@admin_bp.route('/theme-delete/<int:theme_id>', methods=['DELETE', 'OPTIONS'])
def delete_theme(theme_id):
    print("[DEBUG] >>> Funkcija delete_theme je pozvana <<<", flush=True)
    print(f"[DEBUG] DELETE tema pozvana, id = {theme_id}", flush=True)

    token = request.headers.get('Authorization')
    if not token:
        print("[DEBUG] Token ne postoji!", flush=True)
        return jsonify({"message": "Token is missing"}), 403

    decoded = decode_token(token.split()[1])
    print(f"[DEBUG] Token dekodiran: {decoded}", flush=True)
    if "error" in decoded:
        print(f"[DEBUG] Token error: {decoded['error']}", flush=True)
        return jsonify({"message": decoded["error"]}), 403

    if not decoded.get('is_admin'):
        print("[DEBUG] Korisnik nije admin!", flush=True)
        return jsonify({"message": "Unauthorized. Only admins can delete themes."}), 403

    try:
        theme = Theme.query.get(theme_id)
        if not theme:
            return jsonify({"message": "Theme not found"}), 404

        discussions = Discussion.query.filter_by(theme_id=theme_id).all()
        print(f"[DEBUG] Pronađeno diskusija: {len(discussions)}", flush=True)

        for discussion in discussions:
            print(f"[DEBUG] Brišem komentare diskusije ID {discussion.id}...", flush=True)
            deleted_comments = Comment.query.filter_by(discussion_id=discussion.id).delete(synchronize_session=False)
            print(f"[DEBUG] Obrisano komentara: {deleted_comments}", flush=True)

            print(f"[DEBUG] Brišem lajkove/dislajkove diskusije ID {discussion.id}...", flush=True)
            deleted_likes = LikeDislike.query.filter_by(discussion_id=discussion.id).delete(synchronize_session=False)
            print(f"[DEBUG] Obrisano lajkova/dislajkova: {deleted_likes}", flush=True)

            print(f"[DEBUG] Brišem diskusiju ID {discussion.id}...", flush=True)
            db.session.delete(discussion)


        print(f"[DEBUG] Brišem temu ID {theme_id}...", flush=True)
        db.session.delete(theme)

        print(f"[DEBUG] Commit baze...", flush=True)
        db.session.commit()
        print("[DEBUG] Commit uspešan", flush=True)
        return jsonify({"message": "Theme and all related discussions, comments, and likes deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] Greška prilikom brisanja teme ID {theme_id}: {e}", flush=True)
        return jsonify({"message": "Error deleting theme", "error": str(e)}), 500

