import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns"; // instalirajte ovo
import "./Home.css";

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

interface DiscussionProps {
  id: number;
  text: string;
  title: string;
  theme_name: string;
  created_at: string;
  updated_at?: string | null;
  likes: number;
  dislikes: number;
  user_id: number;
}

const Discussion: React.FC<DiscussionProps> = ({
  id,
  text,
  title,
  theme_name,
  created_at,
  updated_at,
  likes: initialLikes,
  dislikes: initialDislikes,
  user_id,
}) => {
  const [discussions, setDiscussions] = useState<DiscussionProps[]>([]);
  const currentUserId = Number(localStorage.getItem("user_id"));

  const [likes, setLikes] = useState<number>(initialLikes);
  const [dislikes, setDislikes] = useState<number>(initialDislikes);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [userAction, setUserAction] = useState<"like" | "dislike" | null>(null);

  const [hasDisliked, setHasDisliked] = useState<boolean>(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [users, setUsers] = useState<string[]>([]);

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<Comment>({
    comment_id: 0,
    user_id: 0,
    text: "",
    mentioned_user_id: null,
    discussion_id: 0,
  });

  function fetchDiscussions() {
    console.log("Fetching discussions...");
    
    fetch("http://localhost:5000/api/discussion/get_all")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setDiscussions(data.discussions);
      })
      .catch((error) => {
        console.error("Error fetching discussions:", error);
        alert("Došlo je do greške prilikom preuzimanja diskusija.");
      });
  }

 const handleAction = (action: "like" | "dislike") => {
  fetch(`http://localhost:5000/api/discussion/like_dislike/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
    body: JSON.stringify({ action }),
  })
    .then(async (response) => {
      const data = await response.json();

      if (!response.ok) {
        console.error("Backend error:", data.message);
        return;
      }

      // OVDE se ažurira broj iz backend odgovora
      setLikes(data.likes);
      setDislikes(data.dislikes);

      if (userAction === action) {
        setUserAction(null); // undo
      } else {
        setUserAction(action);
      }
        fetchDiscussions();
    })
    .catch((error) => {
      console.error("Network or server error:", error);
    });
};


  const [isCommentSectionVisible, setIsCommentSectionVisible] =
    useState<boolean>(false);

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
    // Fetch user details based on user_id
    fetch(`http://localhost:5000/api/user/get_user/${user_id}`)
      .then((response) => response.json())
      .then((data) => setUser(data))
      .catch((error) => console.error("Error fetching user data:", error));
  }, [id, user_id]);

  // Učitavanje komentara (bez čekanja na klik)
  useEffect(() => {
    fetch(`http://localhost:5000/api/comment/getcomments/${id}`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then((data) => setComments(data))
      .catch((error) => console.error("Error fetching comments:", error));
  }, [id]);

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
    const discussionId = e.currentTarget.dataset.id;
    if (discussionId && newComment.text.trim() !== "") {
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
          setComments([...comments, data]); // Add the new comment to the comments list
          setNewComment({ ...newComment, text: "" }); // Clear the input field
          fetchDiscussions(); //Za odma ispravno ispisan komentar
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
  };

  const handleDeleteComment = async (commentId: number) => {
          const token = localStorage.getItem("auth_token");

          if (!token) {
            alert("Not authorized");
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
              // osveži komentare
              fetch(`http://localhost:5000/api/comment/getcomments/${id}`)
                .then((res) => res.json())
                .then((data) => setComments(data));
            } else {
              const data = await response.json();
              console.error("Delete failed:", data.message);
            }
          } catch (error) {
            console.error("Network error:", error);
          }
  };

  const formattedTime = created_at
    ? formatDistanceToNow(new Date(created_at), { addSuffix: true })
    : "Invalid date";

  return (
    <div className="discussion-card">
      <div className="discussion-header">
        <p className="topic">{theme_name}</p>
        <p className="discussion-created">{formattedTime}</p>
      </div>
      <p className="user">posted by: {user?.username}</p>
      <p className="discussion-title">{title}</p>
      <div className="discussion-text">{text}</div>
      <div className="discussion-actions">
      <button
          className={`like-button ${userAction === "like" ? "active" : ""}`}
          onClick={() => handleAction("like")}
        >
          ❤️ {likes}
        </button>
        <button
          className={`dislike-button ${userAction === "dislike" ? "active" : ""}`}
          onClick={() => handleAction("dislike")}
        >
          💔 {dislikes}
        </button>
        <button
          className="comment-button"
          onClick={() => setIsCommentSectionVisible(!isCommentSectionVisible)}
        >
          💬 {comments.length}
        </button>
      </div>

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
                comments.map((comment, index) => {
                  const canDelete = Number(comment.user_id) === currentUserId || Number(user_id) === currentUserId;

                  return (
                    <div key={comment.comment_id ?? index} className="comment">
                      <p>
                        <strong>{users[index] || "loading.."}</strong>: {comment.text}
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteComment(comment.comment_id)}
                            className="delete-comment-button"
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </p>
                    </div>
                  );
                })
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

const Home: React.FC = () => {
  //const username = localStorage.getItem("user_id") || "Guest";
  const username = getUsernameFromToken();

  const [discussions, setDiscussions] = useState<DiscussionProps[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [isAddPostModalVisible, setIsAddPostModalVisible] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostText, setNewPostText] = useState("");
  const [newPostTheme, setNewPostTheme] = useState("");
  const [themes, setThemes] = useState<{ id: number; name: string }[]>([]);

  function getUsernameFromToken(): string {
    const token = localStorage.getItem("auth_token"); // JWT token iz localStorage
    if (token) {
      try {
        const payloadBase64 = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payloadBase64)); // Dekodiramo payload
        return decodedPayload.username || "Guest"; // Vraćamo korisničko ime ili "Guest" ako nije dostupno
      } catch (error) {
        console.error("Error decoding token:", error);
        return "Guest"; // Ako nešto pođe po zlu, vraćamo "Guest"
      }
    }
    return "Guest"; // Ako token ne postoji
  }

  useEffect(() => {
    // Učitavamo sve teme sa servera
    fetch("http://localhost:5000/api/discussion/themes")
      .then((response) => response.json())
      .then((data) => setThemes(data)) // Postavljamo teme u state
      .catch((error) => console.error("Error fetching themes:", error));

    fetch("http://localhost:5000/api/discussion/get_all")
      .then((response) => response.json())
      .then((data) => setDiscussions(data.discussions))
      .catch((error) => console.error("Error fetching discussions:", error));
  }, []);

 
  
  /*useEffect(() => {
    fetch("http://localhost:5000/api/discussion/get_all")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }'
        return response.json();
      })
      .then((data) => {
        console.log(data);
        setDiscussions(data.discussions); 
      })
      .catch((error) => {
        console.error("Error fetching discussions:", error);
      });
  }, []);
*/
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // Prevents page refresh
    console.log("Search started with query:", searchQuery);
    if (searchQuery.trim()) {
      fetch(`http://localhost:5000/api/discussion/search?q=${searchQuery}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Search Results:", data);
          setDiscussions(data); // Sets discussions to the search results
        })
        .catch((error) => {
          console.error("Error fetching search results:", error);
        });
    } else {
      console.log("Search query is empty");
      fetch("http://localhost:5000/api/discussion/get_all")
        .then((response) => response.json())
        .then((data) => setDiscussions(data.discussions))
        .catch((error) => console.error("Error fetching discussions:", error));
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/Login"; // Redirect to login page
  };

  const handleEdit = () => {
    window.location.href = "/user";
  };

  const handleDiscussions = () => {
    window.location.href = "/Discussions"; // Redirect to discussions page
  };

  const handleAddPost = () => {
    console.log();
    setIsAddPostModalVisible(true);
  };

  const handleSavePost = () => {
    if (newPostText.trim() && newPostTheme.trim()) {
      const newDiscussion = {
        title: newPostTitle,
        text: newPostText,
        theme_name: newPostTheme,
      };

      const userToken = localStorage.getItem("auth_token");

      if (!userToken) {
        console.error("User token is not available!");
        return;
      }

      fetch("http://localhost:5000/api/discussion/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(newDiscussion),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("New discussion added:", data);
          setDiscussions([data.discussion, ...discussions]);
          setIsAddPostModalVisible(false);
          setNewPostTitle("");
          setNewPostText("");
          setNewPostTheme(""); // Resetovanje teme
        })
        .catch((error) => console.error("Error adding discussion:", error));
    } else {
      alert("Please fill in all fields!");
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-left">
          <img src="/icon.png" alt="Logo" className="logo" />
          <h1 className="app-name">Chatify</h1>
        </div>
        <div className="navbar-center">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              className="search-input"
            />
            <img src="/search.png" alt="Search Icon" className="search-icon" />
          </div>
        </div>
        <div className="navbar-right">
          <button className="add-post-button" onClick={handleAddPost}>
            Add post +
          </button>
          <div
            className="profile-section"
            onClick={() => setDropdownVisible(!dropdownVisible)}
          >
            <span className="username">{username}</span>
            <img src="/profile.png" alt="Profile" className="profile-icon" />
            <div className={`dropdown-menu ${dropdownVisible ? "active" : ""}`}>
              <button onClick={handleDiscussions}>My discussions</button>
              <button onClick={handleEdit}>Edit Profile</button>
              <button onClick={handleLogout}>Logout</button>
            </div>
            {isAddPostModalVisible && (
              <div className="modal">
                <div className="add-post-container">
                  <h2>Add New Discussion</h2>
                  <input
                    type="text"
                    placeholder="Title"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    className="add-post-title"
                  />
                  <textarea
                    placeholder="Text"
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    className="add-post-text"
                  />
                  <select
                    value={newPostTheme}
                    onChange={(e) => setNewPostTheme(e.target.value)}
                    className="add-post-theme"
                  >
                    <option value="">Select Theme</option>
                    {themes.map((theme) => (
                      <option key={theme.id} value={theme.name}>
                        {theme.name}
                      </option>
                    ))}
                  </select>
                  <div className="add-post-actions">
                    <button onClick={handleSavePost}>Save</button>
                    <button onClick={() => setIsAddPostModalVisible(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
      <div className="discussion-space">
        {/* Discussions Section */}
        <div className="discussions-section">
          {discussions.length > 0 ? (
            discussions.map((discussion) => (
              <Discussion key={discussion.id} {...discussion} />
            ))
          ) : (
            <p>No discussions available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
