import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRouteUser = ({ children }) => {
  const { userInfo } = useSelector((state) => state.userAuth);

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRouteUser;
