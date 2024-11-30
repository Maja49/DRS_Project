import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import "./User.css"; // Importovanje CSS datoteke

const User: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  const [userData, setUserData] = useState({
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = () => {
    console.log("Updated User Data:", userData);
    setShowModal(false);
  };

  return (
    <div className="user-container">
      <div className="user-icon">
        <FaUserCircle size={40} onClick={() => setShowModal(true)} />
      </div>

      <div className="user-content">
        <h1>Dobrodošli na platformu za diskusiju!</h1>
        {/* <p>Ovde možete upravljati svojim profilom.</p> */}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Izmena korisničkih podataka</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
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
                    : key === "email"
                    ? "Email"
                    : key === "password"
                    ? "Lozinka"
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
                      : key === "email"
                      ? "email"
                      : key === "password"
                      ? "lozinku"
                      : key === "username"
                      ? "korisničko ime"
                      : key
                  }`}
                />
              </Form.Group>
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Zatvori
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Sačuvaj izmene
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default User;
