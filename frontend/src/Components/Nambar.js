import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Styles/Navbar.css';
import Spinner from 'react-bootstrap/Spinner';
import { useEffect } from 'react';

const Navbar = () => {
    const { user, isAuthenticated, isLoading, getIdTokenClaims, error } = useAuth0();

    useEffect(() => {
        const logTokenAndSendRequest = async () => {
            console.log('isAuthenticated:', isAuthenticated); // Verificar autenticación

            if (isAuthenticated) {
                try {
                    const tokenClaims = await getIdTokenClaims();
                    const token = tokenClaims.__raw; // Obtener el token en bruto

                    console.log('Token de acceso:', token); // Imprimir token
                    await sendProtectedRequest(token); // Enviar el token al backend
                } catch (error) {
                    console.error('Error al obtener el token:', error);
                }
            } else {
                console.log('El usuario no está autenticado'); // Mensaje si no está autenticado
            }
        };

        logTokenAndSendRequest();
    }, [isAuthenticated, getIdTokenClaims]);

    const sendProtectedRequest = async (token) => {
        try {
            const response = await fetch('http://localhost:4000/protected', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Response from protected route:', data);
            } else {
                console.error('Error accessing protected route:', response.status);
            }
        } catch (error) {
            console.error('Error in sending request:', error);
        }
    };

    // Manejar errores de autenticación
    if (error) {
        console.error('Error de autenticación:', error.message);
        return <div>Error: {error.message}</div>;
    }

    return (
      <nav className="navbar navbar-expand-lg custom-navbar">
        <div className="collapse navbar-collapse justify-content-end me-3">
          {isLoading ? (
            <Spinner
              animation="border"
              role="status"
              style={{ color: 'yellow' }}
            >
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          ) : isAuthenticated ? (
            <div className="navbar-nav align-items-center">
              <img src={user.picture} alt={user.name} className="user-image rounded-circle" style={{ width: "40px", height: "40px", marginRight: "10px" }} />
              <span className="nav-item nav-link text-light">{user.name}</span>
              <LogoutButton className="btn btn-outline-danger" />
            </div>
          ) : (
            <LoginButton className="btn btn-outline-primary" />
          )}
        </div>
      </nav>
    );
};

export default Navbar;
