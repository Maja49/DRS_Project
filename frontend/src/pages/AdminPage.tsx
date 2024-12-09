import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminPage.css";

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
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [activeTab, setActiveTab] = useState<string>("requests");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Dohvatanje zahtjeva za registraciju
  const fetchRegistrationRequests = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setErrorMessage("Unauthorized: No token found.");
      return;
    }

    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/registration-requests",
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
        "http://localhost:5000/api/admin/users",
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
        `http://localhost:5000/api/admin/registration-requests/accept/${userId}`,
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
        `http://localhost:5000/api/admin/registration-requests/reject/${userId}`,
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
    fetchThemes(); // Dohvatanje tema
  }, []);

  const username = localStorage.getItem("user_id") || "Guest";
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSearch = () => {
    fetch(`/api/discussions/search?query=${searchQuery}`)
      .then((response) => response.json())
      .then((data) => console.log(data));
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/Login"; // Redirect to login page
  };

  const handleEdit = () => {
    window.location.href = "/user";
  };

  ////////teme///////////
  // Dohvatanje svih tema
  const fetchThemes = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setErrorMessage("Unauthorized: No token found.");
      return;
    }

    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/theme-list",
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

  // Funkcija za slanje POST zahteva za kreiranje nove teme
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("auth_token");
    if (!token) {
      setErrorMessage("Unauthorized: No token found.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/theme-create", // URL za dodavanje nove teme
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

  const handleDelete = async (themeId: number) => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setErrorMessage("Unauthorized: No token found.");
      return;
    }

    try {
      console.log(themeId);
      const response = await axios.delete(
        `http://localhost:5000/api/admin/theme-delete/${themeId}`, // API endpoint za brisanje teme
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
            <div className={`dropdown-menu ${dropdownVisible ? "active" : ""}`}>
              <button onClick={handleEdit}>Edit Profile</button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="admin-page">
        <div className="tabs">
          <button
            className={activeTab === "requests" ? "active" : ""}
            onClick={() => setActiveTab("requests")}
          >
            Registration Requests
          </button>
          <button
            className={activeTab === "users" ? "active" : ""}
            onClick={() => setActiveTab("users")}
          >
            Approved Users
          </button>
          <button
            className={activeTab === "themes" ? "active" : ""}
            onClick={() => setActiveTab("themes")}
          >
            Themes
          </button>
        </div>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

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
