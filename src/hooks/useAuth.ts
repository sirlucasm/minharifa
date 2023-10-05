import AuthContext from "@/contexts/auth";
import { useContext } from "react";

const useAuth = () => {
  const values = useContext(AuthContext);

  return values;
};

export default useAuth;
