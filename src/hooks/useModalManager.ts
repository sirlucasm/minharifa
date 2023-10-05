import ModalManagerContext from "@/contexts/modalManager";
import { useContext } from "react";

const useModalManager = () => {
  const values = useContext(ModalManagerContext);

  return values;
};

export default useModalManager;
