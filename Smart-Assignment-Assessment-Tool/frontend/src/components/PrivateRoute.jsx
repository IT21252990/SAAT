import { Navigate, Outlet } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

const PrivateRoute = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) return <p>Loading...</p>;

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
