import { useAuth0 } from "@auth0/auth0-react";

const LogoutButton = (props) => {
  const { logout } = useAuth0();

  return (
    <button
      onClick={() => logout()}
      className="btn btn-danger" // Clases de Bootstrap para estilos
    >
      Logout
    </button>
  );
};

export default LogoutButton;
