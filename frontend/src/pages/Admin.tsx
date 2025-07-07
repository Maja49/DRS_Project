import { useEffect, useState } from "react";
import "./Admin.css"; // Dodaj stilove za tabelu po potrebi

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";


interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

const Admin: React.FC = () => {
  const username = localStorage.getItem("user_id") || "Admin";

  const [users, setUsers] = useState<User[]>([]); // Stanje za čuvanje liste korisnika
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch za korisnike
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${BASE_URL}/users`); // Backend ruta za dohvat korisnika
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data: User[] = await response.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load users");
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="admin-container">
      <h1>Admin Panel</h1>
      <h1>Welcome, Admin {username}</h1>

      {error ? (
        <p className="error">{error}</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>{user.name}</td>
                <td>{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Admin;
