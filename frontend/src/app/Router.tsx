import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FireAlertPage } from '../pages';

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FireAlertPage />} />
        <Route path="*" element={<FireAlertPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;