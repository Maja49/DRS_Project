from flask import request, jsonify, Blueprint
from models import db
from models.comment import Comment
from models.user import User
from models.discussion import Discussion
from models.commentdiscussion import CommentDiscussion
from utils.token_utils import decode_token
from utils.email_utils import trigger_email
import re

comment_bp = Blueprint('comment', __name__)

# region creating new comment (mention support)
@comment_bp.route('/comment/<int:discussion_id>', methods=['POST', 'OPTIONS'])
def comment_discussion(discussion_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"message": "Authorization token is missing"}), 401

    try:
        token = token.split()[1]
    except IndexError:
        return jsonify({"message": "Invalid token format"}), 400

    decoded = decode_token(token)
    if "error" in decoded:
        return jsonify({"message": decoded["error"]}), 403

    user_id = decoded.get('user_id')
    if not user_id:
        return jsonify({"message": "User ID not found in token"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"message": "Invalid JSON data"}), 400

    text = data.get('text')
    if not text or not text.strip():
        return jsonify({"message": "Text is required and cannot be empty"}), 400

    discussion = Discussion.query.get(discussion_id)
    if not discussion:
        return jsonify({"message": "Discussion not found"}), 404

    mentioned_user_id = None
    mentioned_usernames = re.findall(r"@([a-zA-Z0-9_]+)", text)
    if mentioned_usernames:
        mentioned_username = mentioned_usernames[0]
        mentioned_user = User.query.filter_by(username=mentioned_username).first()

        if mentioned_user:
            mentioned_user_id = mentioned_user.id
            try:
                trigger_email(
                    "celicdorde@gmail.com",
                    "Mention notification",
                    f"You (@{mentioned_username}) have been mentioned in discussion '{discussion.title}' by @{user.username}."
                )
            except Exception as e:
                print(f"Greška prilikom slanja email-a: {e}")

    new_comment = Comment(
        user_id=user_id,
        text=text.strip(),
        mentioned_user_id=mentioned_user_id,
        discussion_id=discussion_id
    )

    try:
        db.session.add(new_comment)
        db.session.commit()

        new_comment_discussion = CommentDiscussion(
            comment_id=new_comment.id,
            discussion_id=discussion_id
        )
        db.session.add(new_comment_discussion)
        db.session.commit()

        return jsonify({
            "comment_id": new_comment.id,
            "user_id": new_comment.user_id,
            "text": new_comment.text,
            "mentioned_user_id": new_comment.mentioned_user_id,
            "discussion_id": new_comment.discussion_id
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Database error: {str(e)}"}), 500
# endregion

# region getting comments of one discussion
@comment_bp.route('/getcomments/<int:discussion_id>', methods=['GET', 'OPTIONS'])
def get_comments_by_discussion(discussion_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    try:
        discussion = Discussion.query.get(discussion_id)
        if not discussion:
            return jsonify({"message": "Discussion not found"}), 404

        comment_discussions = CommentDiscussion.query.filter_by(discussion_id=discussion_id).all()
        if not comment_discussions:
            return jsonify({"message": "No comments found for this discussion"}), 404

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
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500
# endregion

# region deleting comment
@comment_bp.route('/deletecomment/<int:comment_id>', methods=['DELETE', 'OPTIONS'])
def delete_comment(comment_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"message": "Authorization token is missing"}), 401

    try:
        token = token.split()[1]
    except IndexError:
        return jsonify({"message": "Invalid token format"}), 400

    decoded = decode_token(token)
    if "error" in decoded:
        return jsonify({"message": decoded["error"]}), 403

    user_id = decoded.get('user_id')
    if not user_id:
        return jsonify({"message": "User ID not found in token"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({"message": "Comment not found"}), 404

    discussion = Discussion.query.get(comment.discussion_id)
    if not discussion:
        return jsonify({"message": "Discussion not found"}), 404

    if user.is_admin or user_id == comment.user_id or user_id == discussion.user_id:
        try:
            CommentDiscussion.query.filter_by(comment_id=comment_id).delete()
            db.session.delete(comment)
            db.session.commit()
            return jsonify({"message": "Comment deleted successfully"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": f"Error deleting comment: {str(e)}"}), 500
    else:
        return jsonify({"message": "You do not have permission to delete this comment"}), 403
# endregion
