// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import BooksPage from "./pages/BooksPage/BooksPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/" element={<Navigate to="/books" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;