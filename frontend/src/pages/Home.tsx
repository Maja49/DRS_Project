import React, { useState } from 'react';
import './Home.css';


const Home: React.FC = () => {
  const username = localStorage.getItem("user_id") || "Guest"; // Preuzimanje korisničkog imena iz localStorage
  const [searchQuery, setSearchQuery] = useState<string>('');


  const handleSearch = () => {
    // Pretraga diskusija prema query-u
    fetch(`/api/discussions/search?query=${searchQuery}`)
      .then(response => response.json())
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
            <img
              src="/search.png"
              alt=""
              className="search-icon"
            />
          </div>
        </div>
        <div className="navbar-right">
          <div className="profile-section">
            <span className="username">{username}</span>
            <img
              src="/profile.png"
              alt="Profil"
              className="profile-icon"
            />
          </div>
        </div>
      </nav>

      
    </div>
  );
};


export default Home;
