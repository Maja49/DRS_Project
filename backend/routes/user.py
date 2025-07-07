from flask import Blueprint, request, jsonify
from models import db
from models.user import User
from utils.token_utils import decode_token
from utils.email_utils import trigger_email

user_bp = Blueprint('user', __name__)

# Dobavljanje podataka korisnika prema user_id
@user_bp.route('/get_user/<int:user_id>', methods=['GET', 'OPTIONS'])
def get_user(user_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    user_data = {
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
        "is_approved": user.is_approved
    }

    return jsonify(user_data), 200


# Ažuriranje korisničkog naloga
@user_bp.route('/update_account', methods=['PUT', 'OPTIONS'])
def update_account():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"message": "Token is missing"}), 403

    decoded = decode_token(token.split()[1])
    if "error" in decoded:
        return jsonify({"message": decoded["error"]}), 403

    user_id = decoded["user_id"]
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.json
    if data.get('name'):
        user.name = data['name']
    if data.get('lastname'):
        user.lastname = data['lastname']
    if data.get('adress'):
        user.adress = data['adress']
    if data.get('city'):
        user.city = data['city']
    if data.get('country'):
        user.country = data['country']
    if data.get('phone_number'):
        user.phone_number = data['phone_number']
    if data.get('username'):
        existing_user = User.query.filter_by(username=data['username']).first()
        if existing_user and existing_user.id != user.id:
            return jsonify({"message": "Username already taken"}), 400
        user.username = data['username']
    if data.get('password'):
        user.password = data['password']

    try:
        db.session.commit()
        return jsonify({"message": "Account updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error updating account", "error": str(e)}), 500


# Odobravanje registracije korisnika od strane admina
@user_bp.route('/approve_registration', methods=['POST', 'OPTIONS'])
def approve_registration():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    data = request.json
    user_id = data.get("user_id")
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "Korisnik ne postoji"}), 404

    user.is_approved = True
    db.session.commit()

    trigger_email(
        user.email,
        "Registracija odobrena",
        f"Poštovani {user.name}, vaša registracija je odobrena. Dobrodošli!"
    )

    trigger_email(
        "celicdorde@gmail.com",
        "Korisnik odobren",
        f"Poštovani administratoru, korisnik {user.name} ({user.email}) je uspešno odobren."
    )

    return jsonify({"message": "Registracija odobrena i email poslat korisniku i administratoru."}), 200
