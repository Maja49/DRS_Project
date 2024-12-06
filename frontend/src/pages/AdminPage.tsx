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

const AdminPage: React.FC = () => {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<string>("requests");
  const [errorMessage, setErrorMessage] = useState<string>("");

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
  }, []);

  const username = localStorage.getItem("user_id") || "Guest";
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

  const handleSearch = () => {
    fetch(`/api/discussions/search?query=${searchQuery}`)
      .then((response) => response.json())
      .then((data) => console.log(data));
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/Login"; // Redirect to login page
  };

  ////teme:

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
              <button onClick={() => (window.location.href = "/user")}>
                Edit Profile
              </button>
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
        </div>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

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
