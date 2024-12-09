import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import "./User.css"; // Importovanje CSS datoteke

const User: React.FC = () => {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    country: "",
    phone: "",
    password: "",
    username: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("auth_token"); // Pretpostavka: token je sačuvan u localStorage
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
            name: userData.firstName,
            lastname: userData.lastName,
            adress: userData.address,
            city: userData.city,
            country: userData.country,
            phone_number: userData.phone,
            username: userData.username,
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
        <h1>Izmena korisničkih podataka</h1>
      </div>

      <Form className="user-form">
        {Object.keys(userData).map((key) => (
          <Form.Group className="mb-3" key={key}>
            <Form.Label>
              {key === "firstName"
                ? "Ime"
                : key === "lastName"
                ? "Prezime"
                : key === "address"
                ? "Adresa"
                : key === "city"
                ? "Grad"
                : key === "country"
                ? "Država"
                : key === "phone"
                ? "Broj telefona"
                : key === "username"
                ? "Korisničko ime"
                : key}
            </Form.Label>
            <Form.Control
              type={key === "password" ? "password" : "text"}
              name={key}
              value={(userData as any)[key]}
              onChange={handleChange}
              placeholder={`Unesite ${
                key === "firstName"
                  ? "ime"
                  : key === "lastName"
                  ? "prezime"
                  : key === "address"
                  ? "adresu"
                  : key === "city"
                  ? "grad"
                  : key === "country"
                  ? "državu"
                  : key === "phone"
                  ? "broj telefona"
                  : key === "username"
                  ? "korisničko ime"
                  : key
              }`}
            />
          </Form.Group>
        ))}

        <Button variant="primary" onClick={handleSave} className="save-button">
          Sačuvaj izmene
        </Button>
        <Button
          variant="outline-primary"
          onClick={handleBack}
          className="back-button"
        >
          Nazad
        </Button>
      </Form>
    </div>
  );
};

export default User;
