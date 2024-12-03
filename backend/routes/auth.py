#ovdje se nalaze rute i logika za registraciju, prijavu i uredjivanje profila
from flask import Blueprint, request, jsonify
from models import db
from models.user import User
from flask_jwt_extended import create_access_token
from utils.token_utils import generate_token, decode_token

auth_bp = Blueprint('auth', __name__)

# Ruta za registraciju
@auth_bp.route('/register', methods=['POST'])
def register():
    # Uzimanje podataka iz JSON zahteva
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

    # Provera da li već postoji korisnik
    if User.query.filter_by(username=username).first():
        return jsonify({"message": "Username already exists"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already exists"}), 400

    # Kreiranje novog korisnika
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
        is_admin=is_admin
    )

    # Dodavanje korisnika u bazu
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201

# Ruta za prijavu
@auth_bp.route('/login', methods=['POST'])
def login():
    email = request.json.get('email')
    password = request.json.get('password')

    # Potraži korisnika u bazi
    user = User.query.filter_by(email=email).first()

    if user and user.password == password:
        # Generišemo token
        token = generate_token(user_id=user.id, is_admin=user.is_admin)
        return jsonify({"message": "Login successful", "token": token}), 200
    else:
        return jsonify({"message": "Invalid email or password"}), 401

# Ažuriranje korisničkog profila
@auth_bp.route('/update_account', methods=['PUT'])
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
