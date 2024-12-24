import React, { useState } from "react";
import { MDBContainer } from "mdb-react-ui-kit";
import "./SignUp.css";

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    adress: "",
    city: "",
    country: "",
    phone_number: "",
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Lozinke se ne poklapaju");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.message === "User registered successfully") {
        window.location.href = "/login";
      } else {
        setErrorMessage(data.message || "Registracija nije uspela");
      }
    } catch (error) {
      console.error("Greška prilikom registracije:", error);
      setErrorMessage("Došlo je do greške!");
    }
  };

  return (
    <MDBContainer className="signup-container">
      <h2>Registracija</h2>
      <p>Napravite nalog</p>

      <form onSubmit={handleSubmit}>
        {Object.keys(formData).map((key) => (
          <input
            key={key}
            type={
              key === "password" || key === "confirmPassword"
                ? "password"
                : "text"
            }
            className="form-input"
            placeholder={key.replace(/([A-Z])/g, " $1").toUpperCase()}
            name={key}
            value={formData[key as keyof typeof formData]}
            onChange={handleChange}
            required
          />
        ))}

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <button type="submit" className="btn">
          Registruj se
        </button>

        <a href="/login" className="login-link">
          Već imate nalog? Prijavite se
        </a>
      </form>
    </MDBContainer>
  );
};

export default SignUp;
