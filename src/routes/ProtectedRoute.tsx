import { ReactNode, FC } from "react";
import { Navigate } from "react-router-dom";
import { useGetUserInfo } from "../hooks/auth/useGetUserInfo";
import LogoSpinner from "../components/loaders/FullLogoSpinner";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useGetUserInfo();

  if (loading) {
    return <LogoSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
