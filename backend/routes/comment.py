from flask import request, jsonify, Blueprint
from models import db
from models.comment import Comment
from models.user import User
from models.discussion import Discussion
from models.commentdiscussion import CommentDiscussion  # Importuj CommentDiscussion model
from utils.token_utils import decode_token

# Kreiranje Blueprint-a za komentare
comment_bp = Blueprint('comment', __name__)

@comment_bp.route('/comment/<int:discussion_id>', methods=['POST'])
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

    # Proveri korisnika
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

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
        text=text.strip(),
        mentioned_user_id=mentioned_user_id,
        discussion_id=discussion_id
    )

    try:
        # Dodavanje komentara u tabelu 'comment'
        db.session.add(new_comment)
        db.session.commit()

        # Dodavanje veze u tabelu 'comment_discussion'
        commentdiscussion = CommentDiscussion(
            comment_id=new_comment.id,
            discussion_id=discussion_id
        )
        db.session.add(commentdiscussion)
        db.session.commit()

        return jsonify({
            "message": "Comment added successfully",
            "comment_id": new_comment.id,
            "discussion_id": discussion_id
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error: {e}")
        return jsonify({"message": f"Database error: {str(e)}"}), 500


#dobavljanje komentara diskusije
@comment_bp.route('/getcomments/<int:discussion_id>', methods=['GET'])
def get_comments_by_discussion(discussion_id):
    try:
        # Proveravamo da li diskusija postoji
        discussion = Discussion.query.get(discussion_id)
        if not discussion:
            return jsonify({"message": "Discussion not found"}), 404

        # Dohvatamo sve zapise iz tabele 'comment_discussion' za dati discussion_id
        comment_discussions = CommentDiscussion.query.filter_by(discussion_id=discussion_id).all()
        if not comment_discussions:
            return jsonify({"message": "No comments found for this discussion"}), 404

        # Prikupljamo komentare povezane sa diskusijom
        comments = []
        for cd in comment_discussions:
            comment = Comment.query.get(cd.comment_id)
            if comment:
                comments.append({
                    "comment_id": comment.id,
                    "user_id": comment.user_id,
                    "text": comment.text,
                    "mentioned_user_id": comment.mentioned_user_id
                })

        return jsonify(comments), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500
