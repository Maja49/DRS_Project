import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import "./User.css"; // Importovanje CSS datoteke

const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || "http://localhost:5000";


const User: React.FC = () => {
  const [userData, setUserData] = useState({
    id: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    country: "",
    phone: "",
    email: "",
    password: "",
    username: "",
  });

  // Funkcija za učitavanje podataka korisnika sa servera
  const fetchUserData = async () => {
    const user_id = localStorage.getItem("user_id"); 
    if (!user_id) {
      alert("Token nije pronađen. Prijavite se ponovo.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/user/get_user/${user_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user_id}`, 
        },
      });

      if (response.ok) {
        const result = await response.json();
        setUserData({
          id: result.id, 
          firstName: result.name,
          lastName: result.lastname,
          address: result.adress,
          city: result.city,
          country: result.country,
          phone: result.phone_number,
          email: result.email,
          password: result.password, 
          username: result.username,
        });
      } else {
        const error = await response.json();
        alert(`Greška: ${error.message}`);
      }
    } catch (err) {
      console.error("Error loading user data:", err);
      alert("There has been an error. Try again.");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []); // Prazan niz znači da se poziva samo jednom pri učitavanju

  // Funkcija za promenu podataka korisnika
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const isValidPhoneNumber = (phone: string) => {
    const phoneRegex = /^\+?\d{7,15}$/;
    return phoneRegex.test(phone);
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Funkcija za čuvanje podataka
  const handleSave = async () => {
    const token = localStorage.getItem("auth_token"); 
    if (!token) {
      if (!isValidPhoneNumber(userData.phone)) {
      alert("Phone number is invalid. Use format like +381641234567 or 0641234567.");
      return;
    }
    if (!isValidEmail(userData.email)) {
      alert("Invalid email format. Please enter a valid email address.");
      return;
    }
      alert("Token not found. Try again.");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/user/update_account`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: userData.firstName,
            lastname: userData.lastName,
            adress: userData.address,
            city: userData.city,
            country: userData.country,
            phone_number: userData.phone,
            email: userData.email,
            username: userData.username,
            password: userData.password
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert(result.message); // Poruka o uspešnom ažuriranju
      } else {
        const error = await response.json();
        alert(`Greška: ${error.message}`);
      }
    } catch (err) {
      console.error("Greška prilikom slanja zahteva:", err);
      alert("Došlo je do greške. Pokušajte ponovo.");
    }
  };

  const handleBack = () => {
    window.history.back();
  };

return (
    <div className="user-container">
      <div className="user-header">
        <h1>Edit Profile</h1>
      </div>

     <Form className="user-form">
      <div className="row">
        {Object.keys(userData)
          .filter((key) => key !== "id")
          .map((key) => (
            <div className="col-md-6" key={key}>
              <Form.Group className="mb-3">
                <Form.Label>
                  {key === "firstName"
                    ? "First Name"
                    : key === "lastName"
                    ? "Last Name"
                    : key === "address"
                    ? "Address"
                    : key === "city"
                    ? "City"
                    : key === "country"
                    ? "Country"
                    : key === "phone"
                    ? "Phone number"
                    : key === "email"
                    ? "Email address"
                    : key === "username"
                    ? "Username"
                    : key}
                </Form.Label>
                <Form.Control
                  type={key === "password" ? "password" : "text"}
                  name={key}
                  value={(userData as any)[key]}
                  onChange={handleChange}
                  placeholder={`Enter ${key}`}
                />
                <Form.Control.Feedback type="invalid">
                  Use valid phone number (e.g. +381641234567)
                </Form.Control.Feedback>
              </Form.Group>
            </div>
          ))}
      </div>

      <div className="d-flex justify-content-end gap-2 mt-3">
        <Button variant="outline-secondary" onClick={handleBack}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </Form>
    </div>
  );
};

export default User;
