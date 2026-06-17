import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  const logout = () => {
    // Clear session storage
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('jwtToken');
    sessionStorage.removeItem('role');
    localStorage.removeItem('token');
    
    // Redirect to the home page
    navigate('/');
  };

  return logout;
};



export default Logout;

