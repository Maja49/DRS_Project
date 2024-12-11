import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AdminPage from "./pages/AdminPage";
import User from "./pages/User";
import Home from "./pages/Home";
import Discussions from "./pages/Discussions";

import "./App.css";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/user" element={<User />} />
        <Route path="/home" element={<Home />} />
        <Route path="/discussions" element={<Discussions />} />
      </Routes>
    </Router>
  );
};

export default App;
