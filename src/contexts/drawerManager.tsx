"use client";
import { DrawerManagerContextType } from "@/@types/contexts/drawerManager.type";
import { createContext, useState } from "react";

const DrawerManagerContext = createContext({
  isOpenProfileDrawer: false,
  setIsOpenProfileDrawer: () => {},
} as DrawerManagerContextType);

const DrawerManagerProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpenProfileDrawer, setIsOpenProfileDrawer] = useState(false);

  return (
    <DrawerManagerContext.Provider
      value={{
        isOpenProfileDrawer,
        setIsOpenProfileDrawer,
      }}
    >
      {children}
    </DrawerManagerContext.Provider>
  );
};

export { DrawerManagerProvider };
export default DrawerManagerContext;
