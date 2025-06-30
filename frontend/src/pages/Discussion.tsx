import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns"; // instalirajte ovo
import "./Discussion.css";

interface User {
  username: string;
}

interface Comment {
  comment_id: number;
  user_id: number;
  text: string;
  mentioned_user_id?: number | null;
  discussion_id: number;
}

export interface DiscussionProps {
  id: number;
  text: string;
  title: string;
  theme_name: string;
  created_at: string;
  updated_at?: string | null;
  likes: number;
  dislikes: number;
  user_id: number;
  onDelete?: (id: number) => void;
}

export const Discussion: React.FC<DiscussionProps> = ({
  id,
  text,
  title,
  theme_name,
  created_at,
  // updated_at,
  likes: initialLikes,
  dislikes: initialDislikes,
  user_id,
  onDelete,
}) => {
  const currentUserId = Number(localStorage.getItem("user_id"));
 
  const [likes, setLikes] = useState<number>(initialLikes);
  const [dislikes, setDislikes] = useState<number>(initialDislikes);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [hasDisliked, setHasDisliked] = useState<boolean>(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [users, setUsers] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedText, setEditedText] = useState<string>(text);
  const [editedTitle, setEditedTitle] = useState<string>(title);
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<Comment>({
    comment_id: 0,
    user_id: 0,
    text: "",
    mentioned_user_id: null,
    discussion_id: 0,
  });
  const [isCommentSectionVisible, setIsCommentSectionVisible] =
    useState<boolean>(false);

     console.log("currentUserId:", currentUserId);
  console.log("Discussion author user_id:", user_id);
  comments.forEach((c: Comment) => console.log("Comment user_id:", c.user_id));


  const getUserById = (userId: number | string): Promise<string> => {
    return fetch(`http://localhost:5000/api/user/get_user/${userId}`)
      .then((response) => response.json())
      .then((data: User) => data.username)
      .catch((error) => {
        console.error("Error fetching user data:", error);
        return "Unknown User";
      });
  };

  // Efekat za učitavanje korisničkih podataka
  useEffect(() => {
    const fetchUsers = async () => {
      // Mapiramo sve user_id iz komentara da bismo ih dobili sa API-a
      const userPromises = comments.map(
        (comment) => getUserById(comment.user_id) // user_id može biti broj ili string
      );
      const usersData = await Promise.all(userPromises);
      setUsers(usersData); // Postavljamo korisnička imena
    };

    fetchUsers();
  }, [comments]); // Učitava kada se komentari promene
  useEffect(() => {
    fetch(`http://localhost:5000/api/comment/getcomments/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setComments(data))
      .catch((error) => console.error("Error fetching comments:", error));
  }, [id]);

  useEffect(() => {
    // Fetch user details based on user_id
    fetch(`http://localhost:5000/api/user/get_user/${user_id}`)
      .then((response) => response.json())
      .then((data) => setUser(data))
      .catch((error) => console.error("Error fetching user data:", error));
  }, [user_id]);

  const handleDelete = () => {
    console.log("Fetching data for id diss:", id);
    const token = localStorage.getItem("auth_token");

    fetch(`http://localhost:5000/api/discussion/delete/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          console.log("Discussion deleted successfully");
          onDelete?.(id);
          window.location.reload(); // Reload discussions
        } else {
          console.error("Error deleting discussion");
        }
      })
      .catch((error) => console.error("Error deleting discussion:", error));
  };

  const handleSaveEdit = () => {
    console.log("Fetching data for id diss:", id);

    const token = localStorage.getItem("auth_token"); // Retrieving the token from localStorage

    fetch(`http://localhost:5000/api/discussion/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Including the token in the Authorization header
      },
      body: JSON.stringify({ title: editedTitle, text: editedText }),
    })
      .then((response) => {
        if (response.ok) {
          setIsEditing(false);
          console.log("Discussion updated successfully");
          window.location.reload(); // Refresh
        } else {
          console.error("Error updating discussion");
        }
      })
      .catch((error) => console.error("Error updating discussion:", error));
  };

  const handleLikeDislike = async (action: "like" | "dislike") => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      alert("You need to be logged in to perform this action.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/discussion/like_dislike/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setLikes(data.likes);
        setDislikes(data.dislikes);
        setHasLiked(action === "like");
        setHasDisliked(action === "dislike");
    }
     else {
        console.error(data.message || "An error occurred.");
      }
    } catch (error) {
      console.error("Error sending like/dislike request:", error);
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment((prevComment) => ({
      ...prevComment,
      text: e.target.value,
    }));
  };

  const handleAddComment: React.MouseEventHandler<HTMLButtonElement> = async (
    e
  ) => {
    e.preventDefault();
    const discussionId = Number(e.currentTarget.dataset.id);

    if (!discussionId || isNaN(discussionId)) {
      console.error("Invalid discussionId");
      return;
    }

    if (newComment.text.trim() !== "") {
      try {
        const response = await fetch(
          `http://localhost:5000/api/comment/comment/${discussionId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            body: JSON.stringify({
              text: newComment.text,
              discussion_id: discussionId,
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          fetch(`http://localhost:5000/api/comment/getcomments/${id}`)
          .then(res => res.json())
          .then(data => setComments(data));
          setNewComment({ ...newComment, text: "" });
        } else {
          console.error("Error adding comment:", data.message);
        }
      } catch (error) {
        console.error("Error posting comment:", error);
      }
    }
  };

  const handleCancelComment = () => {
    setNewComment({
      comment_id: 0,
      user_id: 0,
      text: "",
      mentioned_user_id: null,
      discussion_id: 0,
    });
    setIsCommentSectionVisible(false);
  };

  const handleDeleteComment = async (commentId: number) => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      alert("You need to be logged in to perform this action.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/comment/deletecomment/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
          fetch(`http://localhost:5000/api/comment/getcomments/${id}`)
            .then(res => res.json())
            .then(data => setComments(data));
        console.log("Comment deleted successfully");
      } else {
        const data = await response.json();
        console.error(data.message || "Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const formattedTime = created_at
    ? formatDistanceToNow(new Date(created_at), { addSuffix: true })
    : "Invalid date";

  return (
    <div className="discussion-card">
      {!isEditing ? (
        <>
          <div className="discussion-header">
            <p className="topic">{theme_name}</p>
            <button onClick={() => setShowDeleteConfirmation(true)}>
              🗑️ Delete
            </button>
            <button onClick={() => setIsEditing(true)}>✏️ Edit</button>
            <p className="discussion-created">{formattedTime}</p>
          </div>
          <p className="user">posted by: {user?.username}</p>
          <p className="discussion-title">{title}</p>
          <div className="discussion-text">{text}</div>
          <div className="discussion-actions">
            <button
              className={`like-button ${hasLiked ? "active" : ""}`}
              onClick={() => handleLikeDislike("like")}
            >
              ❤️ {likes}
            </button>
            <button
              className={`dislike-button ${hasDisliked ? "active" : ""}`}
              onClick={() => handleLikeDislike("dislike")}
            >
              💔 {dislikes}
            </button>
            <button
              className="comment-button"
              onClick={() =>
                setIsCommentSectionVisible(!isCommentSectionVisible)
              }
            >
              💬 {comments.length}
            </button>
          </div>
        </>
      ) : (
        <div className="edit-discussion">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="Edit title"
          />
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            placeholder="Edit text"
          />
          <button onClick={handleSaveEdit}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      )}

      {showDeleteConfirmation && (
        <div className="delete-confirmation">
          <p>Are you sure you want to delete this discussion?</p>
          <button onClick={handleDelete}>Yes</button>
          <button onClick={() => setShowDeleteConfirmation(false)}>No</button>
        </div>
      )}

      <div className="comment-section">
        {isCommentSectionVisible && (
          <div>
            {/* Comment input */}
            <div className="comment-input-container">
              <input
                type="text"
                placeholder={newComment.text === "" ? "Add Comment..." : ""}
                value={newComment.text}
                onChange={handleCommentChange}
              />
              <div className="comment-buttons">
                <button className="cancel-button" onClick={handleCancelComment}>
                  Cancel
                </button>
                <button
                  className="add-comment-button"
                  data-id={id}
                  onClick={handleAddComment}
                >
                  Add Comment
                </button>
              </div>
            </div>

            {/* List of comments */}
            <div className="comments-list">
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                    <div key={comment.comment_id || index} className="comment">
                    <p>
                      <strong>{users[index] || 'loading..'}</strong>: {comment.text}
                    </p>

                    {(comment.user_id === currentUserId || user_id === currentUserId) && (
                      <button
                        className="delete-comment-button"
                        onClick={() => handleDeleteComment(comment.comment_id)}
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p>No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discussion;
