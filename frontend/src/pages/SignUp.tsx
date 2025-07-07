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
  const BASE_URL = import.meta.env.VITE_API_URL;


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
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
        setErrorMessage(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error while registrating:", error);
      setErrorMessage("There has been an error!");
    }
  };

  return (
    <MDBContainer className="signup-container">
      <h2>Sign Up</h2>
      <p>Register your account</p>

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
          Sign Up
        </button>

        <a href="/login" className="login-link">
          Already have an account? Log In
        </a>
      </form>
    </MDBContainer>
  );
};

export default SignUp;
