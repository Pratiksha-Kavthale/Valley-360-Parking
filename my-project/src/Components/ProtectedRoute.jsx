import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '/src/api';
import { isOwnerPaymentSetupComplete } from '../utils/paymentSetup';

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const location = useLocation();
  const token = sessionStorage.getItem('jwtToken') || localStorage.getItem('token');
  const role = sessionStorage.getItem('role');
  const requiresOwnerPaymentSetup = allowedRoles.includes('ROLE_OWNER') && location.pathname !== '/owner/payment-settings';
  const [checkingPaymentSetup, setCheckingPaymentSetup] = useState(requiresOwnerPaymentSetup);
  const [paymentSetupComplete, setPaymentSetupComplete] = useState(true);

  useEffect(() => {
    let ignore = false;

    const checkOwnerPaymentSetup = async () => {
      if (!token || !requiresOwnerPaymentSetup || role !== 'ROLE_OWNER') {
        setCheckingPaymentSetup(false);
        setPaymentSetupComplete(true);
        return;
      }

      setCheckingPaymentSetup(true);

      try {
        const response = await api.get('/owner/payment-settings');
        if (!ignore) {
          setPaymentSetupComplete(isOwnerPaymentSetupComplete(response.data));
        }
      } catch (error) {
        console.error('Unable to verify owner payment setup:', error);
        if (!ignore) {
          setPaymentSetupComplete(false);
        }
      } finally {
        if (!ignore) {
          setCheckingPaymentSetup(false);
        }
      }
    };

    checkOwnerPaymentSetup();

    return () => {
      ignore = true;
    };
  }, [token, role, requiresOwnerPaymentSetup]);

  if (!token) {
    return <Navigate to="/Login" replace />;
  }

  if (allowedRoles.length > 0 && (!role || !allowedRoles.includes(role))) {
    return <Navigate to="/" replace />;
  }

  if (checkingPaymentSetup) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-700">
        Checking payment setup...
      </div>
    );
  }

  if (requiresOwnerPaymentSetup && !paymentSetupComplete) {
    return <Navigate to="/owner/payment-settings" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
