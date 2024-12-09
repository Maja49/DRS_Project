from flask import Blueprint, request, jsonify
from models import db
from models.user import User
from utils.token_utils import decode_token

user_bp = Blueprint('user', __name__)

# region azuriranje naloga
# Ažuriranje korisničkog profila
@user_bp.route('/update_account', methods=['PUT'])
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