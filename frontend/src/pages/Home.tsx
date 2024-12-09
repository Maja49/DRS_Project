import React, { useEffect, useState } from "react";
// import { formatDistanceToNow } from "date-fns";
import "./Home.css";

interface DiscussionProps {
  id: number;
  text: string;
  title: string;
  theme_name: string;
  created_at: string;
  updated_at?: string | null;
  likes: number;
  dislikes: number;
}

const Discussion: React.FC<DiscussionProps> = ({
  // id,
  text,
  title,
  theme_name,
  created_at,
  updated_at,
  likes: initialLikes,
  dislikes: initialDislikes,
}) => {
  const [likes, setLikes] = useState<number>(initialLikes);
  const [dislikes, setDislikes] = useState<number>(initialDislikes);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [hasDisliked, setHasDisliked] = useState<boolean>(false);
  const [comments, setComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [isCommentSectionVisible, setIsCommentSectionVisible] =
    useState<boolean>(false);

  const handleLike = () => {
    if (!hasLiked) {
      setLikes(likes + 1);
      if (hasDisliked) {
        setDislikes(dislikes - 1);
        setHasDisliked(false);
      }
      setHasLiked(true);
    } else {
      setLikes(likes - 1);
      setHasLiked(false);
    }
  };

  const handleDislike = () => {
    if (!hasDisliked) {
      setDislikes(dislikes + 1);
      if (hasLiked) {
        setLikes(likes - 1);
        setHasLiked(false);
      }
      setHasDisliked(true);
    } else {
      setDislikes(dislikes - 1);
      setHasDisliked(false);
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment(e.target.value);
  };

  const handleAddComment = () => {
    if (newComment.trim() !== "") {
      setComments([...comments, newComment]);
      setNewComment("");
    }
  };

  const handleCancelComment = () => {
    setNewComment(""); // Clears the input field
  };

  /* const formattedTime = formatDistanceToNow(new Date(created_at), { addSuffix: true });*/

  return (
    <div className="discussion-card">
      <div className="discussion-header">
        <p className="topic">{theme_name}</p>
        <p className="discussion-created">{created_at}</p>
        {updated_at && (
          <p className="discussion-updated">Updated At: {updated_at}</p>
        )}
      </div>
      <p className="discussion-title">{title}</p>
      <div className="discussion-text">{text}</div>
      <div className="discussion-actions">
        <button
          className={`like-button ${hasLiked ? "active" : ""}`}
          onClick={handleLike}
        >
          ❤️ {likes}
        </button>
        <button
          className={`dislike-button ${hasDisliked ? "active" : ""}`}
          onClick={handleDislike}
        >
          💔 {dislikes}
        </button>
        <button
          className="comment-button"
          onClick={() => setIsCommentSectionVisible(!isCommentSectionVisible)}
        >
          💬
        </button>
      </div>

      <div className="comment-section">
        {isCommentSectionVisible && (
          <div className="comment-input-container">
            <input
              type="text"
              placeholder={newComment === "" ? "Add Comment..." : ""}
              value={newComment}
              onChange={handleCommentChange}
              onFocus={() => {}}
            />
            <div className="comment-buttons">
              <button className="cancel-button" onClick={handleCancelComment}>
                Cancel
              </button>
              <button className="add-comment-button" onClick={handleAddComment}>
                Comment
              </button>
            </div>
          </div>
        )}

        <div className="comments-list">
          {comments.map((comment, index) => (
            <div key={index} className="comment">
              {comment}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const username = localStorage.getItem("user_id") || "Guest";

  const [discussions, setDiscussions] = useState<DiscussionProps[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [isAddPostModalVisible, setIsAddPostModalVisible] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostText, setNewPostText] = useState("");
  const [newPostTheme, setNewPostTheme] = useState("");
  const [themes, setThemes] = useState<{ id: number; name: string }[]>([]);

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
        }
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
      fetch(
        `http://localhost:5000/api/discussion/search?theme_name=${searchQuery}`
      )
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
            <img src="/profile.png" alt="Profile" className="profile-icon" />
            <span className="username">{username}</span>
            <div className={`dropdown-menu ${dropdownVisible ? "active" : ""}`}>
              <button onClick={() => (window.location.href = "/user")}>
                Edit Profile
              </button>
              <button onClick={handleLogout}>Logout</button>
            </div>
            {isAddPostModalVisible && (
              <div className="modal-overlay">
                <div className="modal">
                  <h2>Add New Discussion</h2>
                  <input
                    type="text"
                    placeholder="Title"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    className="modal-input"
                  />
                  <textarea
                    placeholder="Text"
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    className="modal-textarea"
                  />
                  <select
                    value={newPostTheme}
                    onChange={(e) => setNewPostTheme(e.target.value)}
                    className="modal-select"
                  >
                    <option value="">Select Theme</option>
                    {themes.map((theme) => (
                      <option key={theme.id} value={theme.name}>
                        {theme.name}
                      </option>
                    ))}
                  </select>
                  <div className="modal-actions">
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
