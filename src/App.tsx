import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Menu from './pages/Menu';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';
import { useStore } from './store';

export default function App() {
  const initAuth = useStore(state => state.initAuth);

  // Wake up Firebase Auth the moment the app opens
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="menu" element={<Menu />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="profile" element={<Profile />} />
          
          {/* THE VAULT DOOR: Only admins can enter here */}
          <Route element={<ProtectedRoute />}>
            <Route path="admin" element={<Admin />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}