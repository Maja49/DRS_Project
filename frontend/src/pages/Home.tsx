import React, { useState } from 'react';
import './Home.css';



interface DiscussionProps {
  title: string;
  content: string;
  author: string;
  text: string;
}

const Discussion: React.FC<DiscussionProps> = ({ title, content, author, text }) => {
  const [likes, setLikes] = useState<number>(0);
  const [dislikes, setDislikes] = useState<number>(0);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [hasDisliked, setHasDisliked] = useState<boolean>(false);

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

  const handleCommentClick = () => {
    window.location.href = "/Discussion";
  };

  return (
    <div className="discussion-card">
    <div className="discussion-header">
      <p className="topic">{title}</p>
      <h3 className="discussion-title">{content}</h3>
      <p className="discussion-author">{author}</p>
    </div>
    <div className="discussion-text">
        {content.length > 100 ? `${text.slice(0, 100)}...` : text}
    </div>
    <div className="discussion-actions">
      <button
        className={`like-button ${hasLiked ? 'active' : ''}`}
        onClick={handleLike}
      >
          ❤️ {likes}
        </button>
        <button
          className={`dislike-button ${hasDisliked ? 'active' : ''}`}
          onClick={handleDislike}
        >
          💔 {dislikes}
        </button>
        <button className="comment-button" onClick={handleCommentClick}>
          💬
        </button>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const username = localStorage.getItem('user_id') || 'Guest';
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

  const handleSearch = () => {
    fetch(`/api/discussions/search?query=${searchQuery}`)
      .then((response) => response.json())
      .then((data) => console.log(data));
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/Login'; // Redirect to login page
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
              onBlur={handleSearch}
              className="search-input"
            />
            <img src="/search.png" alt="Search Icon" className="search-icon" />
          </div>
        </div>
        <div className="navbar-right">
          <div
            className="profile-section"
            onClick={() => setDropdownVisible(!dropdownVisible)}
          >
            <img src="/profile.png" alt="Profile" className="profile-icon" />
            <span className="username">{username}</span>
            <div className={`dropdown-menu ${dropdownVisible ? 'active' : ''}`}>
              <button onClick={() => (window.location.href = '/user')}>
                Edit Profile
              </button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sekcija za diskusije */}
      <div className="discussions-section">
        <Discussion
          title="React vs Angular"
          content="Which one do you prefer and why?"
          text = "Jskjdksjdknsnsjkfdsfjkdsssssssssssssjfkjdhfkjdhsjkfhdsjkhfjdskhfjdshfjbdskcbkjsabkjbvjksavbjksbajvbjsabvkasbvkjbsjkvbjskvbjksabvjkawjewqijwjroiewjifodkvndmbv"
          author="John Doe"
        />
        <Discussion
          title="Best practices for REST APIs"
          content="Share your favorite tips for designing RESTful APIs."
          author="Jane Smith"
          text = "Jskjdksjdknsnsjkfdsfjkdsssssssssssssjfkjdhfkjdhsjkfhdsjkhfjdskhfjdshfjbdskcbkjsabkjbvjksavbjksbajvbjsabvkasbvkjbsjkvbjskvbjksabvjkawjewqijwjroiewjifodkvndmbv"
        />
      </div>
    </div>
  );
};

export default Home;
