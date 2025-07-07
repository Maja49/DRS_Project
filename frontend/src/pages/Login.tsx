import React, { useState } from "react";
import { MDBContainer } from "mdb-react-ui-kit";
import { jwtDecode } from "jwt-decode"; //  import
import "./Login.css";

// Definisanje tipa za dekodirani token
interface DecodedToken {
  user_id: string;
  is_admin: boolean;
  is_approved: boolean;
  username: string;
}

const Login: React.FC = () => {
  // Stanje za email, password, errorMessage, username i isAdmin
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Handler za prijavu
  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email || !password) {
      setErrorMessage("Please fill in both fields");
      return;
    }

    try {
      const response = await fetch("https://drs-backend.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });


      const data = await response.json();
      console.log(data);

      if (data.token) {
        // Spremanje tokena u localStorage
        localStorage.setItem("auth_token", data.token);

        const decoded = jwtDecode<DecodedToken>(data.token);
        localStorage.setItem("user_id", decoded.user_id);
        localStorage.setItem("is_admin", decoded.is_admin ? "true" : "false");
        localStorage.setItem(
          "is_approved",
          decoded.is_approved ? "true" : "false"
        );
        localStorage.setItem("username", decoded.username);

        if (!decoded.is_approved && !decoded.is_admin) {
          setErrorMessage(
            "Your account is not approved yet. Please contact admin."
          );
          return;
        } else if (decoded.is_approved && !decoded.is_admin) {
          window.location.href = "/home";
        } else if (!decoded.is_approved && decoded.is_admin) {
          window.location.href = "/admin";
        } else {
          window.location.href = "/admin";
        }

        // Preusmeravanje na odgovarajuću stranicu
        // if (decoded.is_admin) {
        //   window.location.href = "/admin";
        // } else {
        //   window.location.href = "/home";
        // }
      } else {
        setErrorMessage(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage("Something went wrong!");
    }
  };

  return (
    <MDBContainer className="login-container">
      <h2>Welcome Back</h2>
      <p>Login to access your account</p>

      <form onSubmit={handleLogin}>
        {/* Email Input */}
        <input
          type="email"
          className="form-input"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password Input */}
        <input
          type="password"
          className="form-input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Error Message */}
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        {/* Login Button */}
        <button type="submit" className="btn">
          Login
        </button>

        {/* Signup Link */}
        <a href="/signup" className="signup-link">
          Don't have an account? Sign Up
        </a>
      </form>
    </MDBContainer>
  );
};

export default Login;
