import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Sidebar from '../ui/Sidebar';

/**
 * MainLayout - Wraps pages with the sidebar navigation
 * Automatically determines user role and shows appropriate menu
 */
const MainLayout = ({ children, forceVariant = null }) => {
  const [user, setUser] = useState(null);
  const [variant, setVariant] = useState('public');

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // Determine variant based on user role
      if (forceVariant) {
        setVariant(forceVariant);
      } else if (userData.role === 'ROLE_ADMIN') {
        setVariant('admin');
      } else if (userData.role === 'ROLE_OWNER') {
        setVariant('owner');
      } else if (userData.role === 'ROLE_CUSTOMER') {
        setVariant('user');
      } else {
        setVariant('public');
      }
    } else {
      setVariant(forceVariant || 'public');
    }
  }, [forceVariant]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      {/* Sidebar */}
      <Sidebar variant={variant} user={user} />

      {/* Main Content - offset for sidebar */}
      <main className="lg:ml-20 min-h-screen">
        {children}
      </main>
    </div>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
  forceVariant: PropTypes.oneOf(['admin', 'owner', 'user', 'public']),
};

export default MainLayout;
