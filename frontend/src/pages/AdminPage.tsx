import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./AdminPage.css";
import "./Discussion";
import { DiscussionProps } from "./Discussion";
import { Discussion } from "./Discussion";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";



interface RegistrationRequest {
  id: number;
  name: string;
  lastname: string;
  email: string;
  username: string;
  accept_url: string;
  reject_url: string;
}

interface User {
  id: number;
  name: string;
  lastname: string;
  email: string;
  username: string;
  is_admin: boolean;
}

interface Theme {
  id: number;
  name: string;
  description: string;
}

const AdminPage: React.FC = () => {
  const [username, setUsername] = useState<string>("Guest");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "requests";
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [discussions, setDiscussions] = useState<DiscussionProps[]>([]);
  const [isAddPostModalVisible, setIsAddPostModalVisible] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostText, setNewPostText] = useState("");
  const [newPostTheme, setNewPostTheme] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const navigate = useNavigate();
  const changeTab = (tabName: string) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/Login", { replace: true }); // Ako nema tokena, idi na login i zameni istoriju
      return;
    }

    // Blokiraj back dugme (da ne moze nazad na login)
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = function () {
      window.history.go(1);
    };

    return () => {
      window.onpopstate = null;
    };
  }, [navigate]);

  useEffect(() => {
    const { username, userId } = getUserInfoFromToken();
    setUserId(userId);
    setUsername(username);
  }, []);

  const myDiscussions = discussions.filter(
    (discussion) => discussion.user_id === userId
  );

  function getUserInfoFromToken(): { username: string; userId: number | null } {
    const token = localStorage.getItem("auth_token");
    if (token) {
      try {
        const payloadBase64 = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        return {
          username: decodedPayload.username || "Guest",
          userId: decodedPayload.user_id || null,
        };
      } catch (error) {
        console.error("Error decoding token:", error);
        return { username: "Guest", userId: null };
      }
    }
    return { username: "Guest", userId: null };
  }

  // Dohvatanje zahtjeva za registraciju
  const fetchRegistrationRequests = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setErrorMessage("Unauthorized: No token found.");
      return;
    }

    try {
      const response = await axios.get(
        `${BASE_URL}/admin/registration-requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRequests(response.data);
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        setErrorMessage("Access Denied: Admin privileges required.");
      } else {
        setErrorMessage("Error fetching registration requests.");
      }
      console.error(error);
    }
  };

  // Dohvatanje svih korisnika koji nisu admini
  const fetchUsers = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setErrorMessage("Unauthorized: No token found.");
      return;
    }

    try {
      const response = await axios.get(
        `${BASE_URL}/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsers(response.data.users); // Server već filtrira korisnike koji nisu admini
    } catch (error) {
      console.error("Error fetching users:", error);
      setErrorMessage("Error fetching users.");
    }
  };

  // Prihvatanje zahtjeva
  const handleAccept = async (userId: number) => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setErrorMessage("Unauthorized: No token found.");
      return;
    }

    try {
      await axios.put(
        `${BASE_URL}/admin/registration-requests/accept/${userId}`,
        {}, // Prazan body
        {
          headers: {
            Authorization: `Bearer ${token}`, // Pravilno postavljanje header-a
          },
        }
      );

      // Uklanjanje zahtjeva iz liste nakon prihvatanja
      setRequests((prev) => prev.filter((req) => req.id !== userId));
    } catch (error) {
      console.error("Error accepting request:", error);
      setErrorMessage("Error accepting request.");
    }
  };

  // Odbijanje zahtjeva
  const handleReject = async (userId: number) => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setErrorMessage("Unauthorized: No token found.");
      return;
    }

    try {
      await axios.delete(
        `${BASE_URL}/admin/registration-requests/reject/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Nakon što je zahtev odbijen, filtrirajte listu zahtjeva
      setRequests((prev) => prev.filter((req) => req.id !== userId));
    } catch (error) {
      console.error("Error rejecting request:", error);
      setErrorMessage("Error rejecting request.");
    }
  };

  useEffect(() => {
    fetchRegistrationRequests();
    fetchUsers();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim() === "") {
        fetchDiscussions();
      } else {
        handleSearch(searchQuery);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    const url = query.trim()
      ? `${BASE_URL}/discussion/search?q=${encodeURIComponent(
          query
        )}`
      : `${BASE_URL}/discussion/get_all`;

    // Fetch zahteva za pretragu
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setDiscussions(data); // Postavi rezultate pretrage
      })
      .catch((error) => {
        console.error("Error fetching search results:", error);
      });
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/Login"; // Redirect to login page
  };

  const handleEdit = () => {
    navigate("/user");
  };

  ////////teme i duskusije///////////
  const fetchDiscussions = () => {
    fetch(`${BASE_URL}/discussion/get_all`)
      .then((response) => response.json())
      .then((data) => setDiscussions(data.discussions))
      .catch((error) => console.error("Error fetching discussions:", error));
  };

  useEffect(() => {
    // Učitavamo sve teme sa servera
    fetch(`${BASE_URL}/discussion/themes`)
      .then((response) => response.json())
      .then((data) => setThemes(data)) // Postavljamo teme u state
      .catch((error) => console.error("Error fetching themes:", error));

    fetchDiscussions();
  }, []);

  const handleDiscussions = () => {
    changeTab("my-discussions");

    setTimeout(() => {
      const adminPageDiv = document.querySelector(".admin-page");
      if (adminPageDiv) {
        adminPageDiv.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 0);
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

      fetch(`${BASE_URL}/discussion/create`, {
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

  const handleDelete = async (themeId: number) => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setErrorMessage("Unauthorized: No token found.");
      return;
    }

    try {
      console.log(themeId);
      const response = await axios.delete(
        `${BASE_URL}/admin/theme-delete/${themeId}`, // API endpoint za brisanje teme
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Uklanjanje teme iz liste nakon uspešnog brisanja
      setThemes((prevThemes) =>
        prevThemes.filter((theme) => theme.id !== themeId)
      );
      setSuccessMessage(response.data.message); // Prikazivanje poruke o uspehu
    } catch (error) {
      console.error("Error deleting theme:", error);
      setErrorMessage("Error deleting theme.");
    }
  };

  const fetchThemes = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setErrorMessage("Unauthorized: No token found.");
      return;
    }

    try {
      const response = await axios.get(
        `${BASE_URL}/admin/theme-list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setThemes(response.data);
    } catch (error) {
      console.error("Error fetching themes:", error);
      setErrorMessage("Error fetching themes.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("auth_token");
    if (!token) {
      setErrorMessage("Unauthorized: No token found.");
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/admin/theme-create`, // URL za dodavanje nove teme
        {
          name: name,
          description: description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage(response.data.message);
      setName(""); // Resetovanje stanja za ime
      setDescription(""); // Resetovanje stanja za opis
      fetchThemes(); // Osvežavanje liste tema
    } catch (error: any) {
      if (error.response) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Error creating theme.");
      }
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-left">
          <img src="/icon.png" alt="Logo" className="logo" />
          <h1 className="app-name" onClick={() => navigate("/admin")}>
            Chatify
          </h1>
        </div>
        <div className="navbar-center">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search... by Theme Name, Email, etc."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

      <div className="admin-page">
        <div className="tabs">
          <button
            className={activeTab === "requests" ? "active" : ""}
            onClick={() => changeTab("requests")}
          >
            Registration Requests
          </button>
          <button
            className={activeTab === "users" ? "active" : ""}
            onClick={() => changeTab("users")}
          >
            Approved Users
          </button>
          <button
            className={activeTab === "themes" ? "active" : ""}
            onClick={() => changeTab("themes")}
          >
            Themes
          </button>
          <button
            className={activeTab === "discussion" ? "active" : ""}
            onClick={() => changeTab("discussion")}
          >
            Discussions
          </button>
        </div>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        {activeTab === "my-discussions" && (
          <div className="discussion-space">
            {myDiscussions.length > 0 ? (
              myDiscussions.map((discussion) => (
                <Discussion
                  key={discussion.id}
                  {...discussion}
                  onUpdate={() => fetchDiscussions()}
                  onDelete={(id) =>
                    setDiscussions(discussions.filter((d) => d.id !== id))
                  }
                />
              ))
            ) : (
              <p>You haven't created any discussions yet.</p>
            )}
          </div>
        )}

        {activeTab === "discussion" && (
          <div className="discussion-space">
            {/* Discussions Section */}
            <div className="discussions-section">
              {discussions.length > 0 ? (
                discussions.map((discussion) => (
                  <Discussion
                    key={discussion.id}
                    {...discussion}
                    onUpdate={() => fetchDiscussions()}
                    onDelete={(id) =>
                      setDiscussions(discussions.filter((d) => d.id !== id))
                    }
                  />
                ))
              ) : (
                <p>No discussions available</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "themes" && (
          <>
            <button
              className="add-theme-button"
              onClick={() => setActiveTab("add-theme")}
            >
              Add New Theme
            </button>

            {!errorMessage && themes.length === 0 && (
              <p className="no-themes">No themes available.</p>
            )}
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {themes.map((theme) => (
                  <tr key={theme.id}>
                    <td>{theme.name}</td>
                    <td>{theme.description}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(theme.id)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Forma za dodavanje nove teme */}
        {activeTab === "add-theme" && (
          <form onSubmit={handleSubmit}>
            <h3>Add New Theme</h3>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Description:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <button type="submit">Create Theme</button>
          </form>
        )}

        {activeTab === "requests" && (
          <>
            {!errorMessage && requests.length === 0 && (
              <p className="no-requests">No pending registration requests.</p>
            )}
            <ul>
              {requests.map((req) => (
                <li key={req.id} className="request-item">
                  <p>
                    <strong>Name:</strong> {req.name} {req.lastname}
                  </p>
                  <p>
                    <strong>Email:</strong> {req.email}
                  </p>
                  <p>
                    <strong>Username:</strong> {req.username}
                  </p>
                  <div className="action-buttons">
                    <button
                      className="accept-button"
                      onClick={() => handleAccept(req.id)}
                    >
                      Accept
                    </button>
                    <button
                      className="reject-button"
                      onClick={() => handleReject(req.id)}
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {activeTab === "users" && (
          <>
            {!errorMessage && users.length === 0 && (
              <p className="no-users">No approved users found.</p>
            )}
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Username</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      {user.name} {user.lastname}
                    </td>
                    <td>{user.email}</td>
                    <td>{user.username}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
