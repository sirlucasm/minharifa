import DrawerManagerContext from "@/contexts/drawerManager";
import { useContext } from "react";

const useDrawerManager = () => {
  const values = useContext(DrawerManagerContext);

  return values;
};

export default useDrawerManager;
