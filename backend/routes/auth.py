#ovdje se nalaze rute i logika za registraciju, prijavu i uredjivanje profila
from flask import Blueprint, request, jsonify
from models import db
from models.user import User
from flask_jwt_extended import create_access_token
from utils.token_utils import generate_token, decode_token
from utils.email_utils import trigger_email


auth_bp = Blueprint('auth', __name__)

# region registracija korisnickog naloga
# Ruta za registraciju
@auth_bp.route('/register', methods=['POST', "OPTIONS"])
def register():
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

    # Provera da li već postoji korisnik
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
        print(f"Error during registration: {e}")  # Ispis u log
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


    #return jsonify({"message": "User registered successfully"}), 201
# endregion


# region prijava korisnika
# Ruta za prijavu
@auth_bp.route("/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return jsonify({}), 200 
    
    
    data = request.json
    email = request.json.get('email')
    password = request.json.get('password')

    # Potraži korisnika u bazi
    user = User.query.filter_by(email=email).first()

    if user and user.password == password:
        # Generišemo token
        token = generate_token(user_id=user.id, is_admin=user.is_admin, username=user.username, is_approved=user.is_approved)

        if user.is_first_login:
            # Pošaljite email administratoru
            trigger_email(
                "celicdorde@gmail.com",
                "Prva prijava korisnika",
                f"Korisnik {user.name} ({user.email}) se prijavio po prvi put."
            )
            user.is_first_login = False
            db.session.commit()

        return jsonify({"message": "Login successful", "token": token}), 200
    else:
        return jsonify({"message": "Invalid email or password"}), 401# endregion

# region azuriranje naloga
# Ažuriranje korisničkog profila
@auth_bp.route('/update_account', methods=['PUT', 'OPTIONS'])
def update_account():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"message": "Token is missing"}), 403

    # Validacija tokena
    decoded = decode_token(token.split()[1])
    if "error" in decoded:
        return jsonify({"message": decoded["error"]}), 403

    user_id = decoded["user_id"]

    # Pronalaženje korisnika prema ID-ju iz tokena
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    # Ažuriranje podataka
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

    # Čuvanje promena
    try:
        db.session.commit()
        return jsonify({"message": "Account updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error updating account", "error": str(e)}), 500
# endregion

@auth_bp.route('/approve_user/<int:user_id>', methods=['PATCH', 'OPTIONS'])
def approve_user(user_id):
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"message": "Token is missing"}), 403

    # Validacija tokena
    decoded = decode_token(token.split()[1])
    if "error" in decoded:
        return jsonify({"message": decoded["error"]}), 403

    user_id_admin = decoded["user_id"]
    is_admin = decoded["is_admin"]

    if not is_admin:
        return jsonify({"message": "You must be an admin to approve users"}), 403

    # Pronalaženje korisnika prema ID-ju iz URL-a
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    # Ako je korisnik već odobren
    if user.is_approved:
        return jsonify({"message": "User is already approved"}), 400

    # Postavljanje statusa korisnika kao odobrenog
    user.is_approved = True
    db.session.commit()

    # Slanje email obavestenja administratoru da je korisnik odobren
    trigger_email(
        "celicdorde@gmail.com",  # Email administratora
        "Korisnik odobren",
        f"Administrator je odobrio korisnika {user.name} ({user.email})."
    )

    return jsonify({"message": f"User {user.name} has been approved."}), 200

# Ruta za odbijanje korisnika (admin)
@auth_bp.route('/reject_user/<int:user_id>', methods=['PATCH', 'OPTIONS'])
def reject_user(user_id):
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"message": "Token is missing"}), 403

    # Validacija tokena
    decoded = decode_token(token.split()[1])
    if "error" in decoded:
        return jsonify({"message": decoded["error"]}), 403

    user_id_admin = decoded["user_id"]
    is_admin = decoded["is_admin"]

    if not is_admin:
        return jsonify({"message": "You must be an admin to reject users"}), 403

    # Pronalaženje korisnika prema ID-ju iz URL-a
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    # Postavljanje statusa korisnika kao odbijenog
    user.is_approved = False
    db.session.commit()

    # Slanje email obavestenja administratoru da je korisnik odbijen
    trigger_email(
        "celicdorde@gmail.com",  # Email administratora
        "Korisnik odbijen",
        f"Administrator je odbio korisnika {user.name} ({user.email})."
    )

    return jsonify({"message": f"User {user.name} has been rejected."}), 200