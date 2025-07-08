from flask import Blueprint, request, jsonify
from models import db
from models.user import User
from flask_jwt_extended import create_access_token
from utils.token_utils import generate_token, decode_token
from utils.email_utils import trigger_email
import re

auth_bp = Blueprint('auth', __name__)

# region registracija korisnickog naloga
@auth_bp.route('/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    name = request.json.get('name')
    lastname = request.json.get('lastname')
    adress = request.json.get('adress')
    city = request.json.get('city')
    country = request.json.get('country')
    phone_number = request.json.get('phone_number')
    email = request.json.get('email')
    password = request.json.get('password')
    username = request.json.get('username')
    is_admin = request.json.get('is_admin', False)
    is_approved = request.json.get('is_approved', False)

    if not phone_number or not re.match(r'^\+?\d{7,15}$', phone_number):
        return jsonify({"message": "Invalid phone number. Format must start with '+' and contain 7 to 15 digits."}), 400

    # Validacija email adrese
    if not email or not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"message": "Invalid email format. Must be in the form name@example.com"}), 400


    if User.query.filter_by(username=username).first():
        return jsonify({"message": "Username already exists"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already exists"}), 400
    

    new_user = User(
        name=name,
        lastname=lastname,
        adress=adress,
        city=city,
        country=country,
        phone_number=phone_number,
        email=email,
        password=password,
        username=username,
        is_admin=is_admin,
        is_approved=is_approved,
    )

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error during registration: {e}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500
# endregion

# region prijava korisnika
@auth_bp.route("/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and user.password == password:
        token = generate_token(user_id=user.id, is_admin=user.is_admin, username=user.username, is_approved=user.is_approved)

        if user.is_first_login:
            trigger_email(
                "celicdorde@gmail.com",
                "Prva prijava korisnika",
                f"Korisnik {user.name} ({user.email}) se prijavio po prvi put."
            )
            user.is_first_login = False
            db.session.commit()

        return jsonify({"message": "Login successful", "token": token}), 200
    else:
        return jsonify({"message": "Invalid email or password"}), 401
# endregion

# region azuriranje naloga
@auth_bp.route('/update_account', methods=['PUT', 'OPTIONS'])
def update_account():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"message": "Token is missing"}), 403

    decoded = decode_token(token.split()[1])
    if "error" in decoded:
        return jsonify({"message": decoded["error"]}), 403

    user = User.query.get(decoded["user_id"])
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
        user.username = data['username']

    try:
        db.session.commit()
        return jsonify({"message": "Account updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error updating account", "error": str(e)}), 500
# endregion

@auth_bp.route('/approve_user/<int:user_id>', methods=['PATCH', 'OPTIONS'])
def approve_user(user_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"message": "Token is missing"}), 403

    decoded = decode_token(token.split()[1])
    if "error" in decoded:
        return jsonify({"message": decoded["error"]}), 403

    if not decoded["is_admin"]:
        return jsonify({"message": "You must be an admin to approve users"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    if user.is_approved:
        return jsonify({"message": "User is already approved"}), 400

    user.is_approved = True
    db.session.commit()

    trigger_email(
        "celicdorde@gmail.com",
        "Korisnik odobren",
        f"Administrator je odobrio korisnika {user.name} ({user.email})."
    )

    return jsonify({"message": f"User {user.name} has been approved."}), 200

@auth_bp.route('/reject_user/<int:user_id>', methods=['PATCH', 'OPTIONS'])
def reject_user(user_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"message": "Token is missing"}), 403

    decoded = decode_token(token.split()[1])
    if "error" in decoded:
        return jsonify({"message": decoded["error"]}), 403

    if not decoded["is_admin"]:
        return jsonify({"message": "You must be an admin to reject users"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    user.is_approved = False
    db.session.commit()

    trigger_email(
        "celicdorde@gmail.com",
        "Korisnik odbijen",
        f"Administrator je odbio korisnika {user.name} ({user.email})."
    )

    return jsonify({"message": f"User {user.name} has been rejected."}), 200
