import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = (props) => {
  const { loginWithRedirect } = useAuth0();

  return (
    <button
      onClick={() => loginWithRedirect()}
      className="btn btn-primary" // Clases de Bootstrap para estilos
    >
      Login
    </button>
  );
};

export default LoginButton;
