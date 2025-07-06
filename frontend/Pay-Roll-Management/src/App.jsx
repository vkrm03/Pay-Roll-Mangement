import React from 'react';
import { Routes, Route } from 'react-router-dom';
import "../public/styles/index.css"
import Navbar from './Pages/Navbar';
import Login from './Pages/Login';

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
};

export default App;
