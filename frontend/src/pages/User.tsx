import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import "./User.css"; // Importovanje CSS datoteke

const User: React.FC = () => {
  const [userData, setUserData] = useState({
    id: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    country: "",
    phone: "",
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
      const response = await fetch(`http://localhost:5000/api/user/get_user/${user_id}`, {
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
          password: result.password, 
          username: result.username,
        });
      } else {
        const error = await response.json();
        alert(`Greška: ${error.message}`);
      }
    } catch (err) {
      console.error("Greška prilikom učitavanja korisničkih podataka:", err);
      alert("Došlo je do greške. Pokušajte ponovo.");
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

  // Funkcija za čuvanje podataka
  const handleSave = async () => {
    const token = localStorage.getItem("auth_token"); 
    if (!token) {
      alert("Token nije pronađen. Prijavite se ponovo.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/user/update_account",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: userData.id, // Uključivanje ID korisnika za ažuriranje
            name: userData.firstName,
            lastname: userData.lastName,
            adress: userData.address,
            city: userData.city,
            country: userData.country,
            phone_number: userData.phone,
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
        {Object.keys(userData).map((key) => (
          <Form.Group className="mb-3" key={key}>
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
                : key === "username"
                ? "Username"
                : key}
            </Form.Label>
            <Form.Control
              type={key === "password" ? "password" : "text"}
              name={key}
              value={(userData as any)[key]}
              onChange={handleChange}
              placeholder={`Unesite ${key}`}
            />
          </Form.Group>
        ))}

        <Button variant="primary" onClick={handleSave} className="save-button">
          Save changes
        </Button>
        <Button
          variant="outline-primary"
          onClick={handleBack}
          className="back-button"
        >
          Back
        </Button>
      </Form>
    </div>
  );
};

export default User;
