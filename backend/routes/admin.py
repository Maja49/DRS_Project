from flask import Blueprint, jsonify, request
from models.user import db, User
from flask_socketio import SocketIO, emit
from utilis.token_utilis import decode_token #i admin dobija token kad se prijavi

admin_bp = Blueprint('admin', __name__)
socketio = SocketIO() #ovo ce sluziti da se automatski azuriraju zahtjevi

def admin_required(f):
    #provjera da li admin ima token(stavlja se u header authorization)
    def wrapper(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"message": "Token is missing"}), 403
        
        # validacija tokena, ako vrati gresku, token nije ispravan
        decoded = decode_token(token.split()[1])
        if "error" in decoded:
            return jsonify({"message": decoded["error"]}), 403

        # provjera korisnikovog polja is_admin, ako je 1 onda je admin, ako ne nema pravo pristupa
        if not decoded.get("is_admin"):
            return jsonify({"message": "Admin access required"}), 403
        
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

#admin vidi sve zahtjeve za registraciju
@admin_bp.route('/registration-requests', methods=['GET'])
@admin_required
def get_registration_requests():
    #prikaz svih korisnika koji cekaju odobrenje, tj. polje is_approved im je jos uvijek false
    pending_users = User.query.filter_by(is_approved=False).all()
    return jsonify([{
        'id': user.id,
        'name': user.name,
        'lastname': user.lastname,
        'email': user.email,
        'username': user.username,
        #naredna dva polja su tu za bolji prikaz zahtjeva, kao dugmad accept i reject
        'accept_url': f'/api/admin/registration-requests/accept/{user.id}',
        'reject_url': f'/api/admin/registration-requests/reject/{user.id}'
    } for user in pending_users])

#prihvatanje korisnikovog zahtjeva za registraciju
@admin_bp.route('/registration-requests/accept/<int:user_id>', methods=['PUT'])
@admin_required
def accept_registration_request(user_id):
    #prihvatanje zahtjeva za registraciju korisnika
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    #azuriraj is_approved na true
    user.is_approved = True
    try:
        db.session.commit()
        #emitujemo dogadjaj preko WebSocket-a za obavestavanje frontenda, na frontu ce se kreirati u JS prijavljivanje na WEBSOCKET dogadjaj
        socketio.emit('user_approved', {'user_id': user.id}, broadcast=True)
        return jsonify({"message": "User registration accepted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error accepting registration", "error": str(e)}), 500

#odbijanje korisnikovog zahtjeva za registraciju
@admin_bp.route('/registration-requests/reject/<int:user_id>', methods=['DELETE'])
@admin_required
def reject_registration_request(user_id):
    #odbijanje zahtjeva za registraciju korisnika (brisanje korisnika)
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    # brisanje korisnika iz baze
    try:
        db.session.delete(user)
        db.session.commit()
        #emitujemo dogadjaj preko WebSocket-a za obavestavanje frontenda
        socketio.emit('user_rejected', {'user_id': user.id}, broadcast=True)

        return jsonify({"message": "User registration rejected and user deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error rejecting registration", "error": str(e)}), 500
