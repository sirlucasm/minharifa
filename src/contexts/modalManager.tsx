"use client";
import { ModalManagerContextType } from "@/@types/contexts/modalManager.type";
import { createContext, useState } from "react";

const ModalManagerContext = createContext({
  isOpenInvitesModal: false,
  setIsOpenInvitesModal: () => {},
} as ModalManagerContextType);

const ModalManagerProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpenInvitesModal, setIsOpenInvitesModal] = useState(false);

  return (
    <ModalManagerContext.Provider
      value={{
        isOpenInvitesModal,
        setIsOpenInvitesModal,
      }}
    >
      {children}
    </ModalManagerContext.Provider>
  );
};

export { ModalManagerProvider };
export default ModalManagerContext;
