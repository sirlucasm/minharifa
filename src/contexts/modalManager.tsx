"use client";
import { ModalManagerContextType } from "@/@types/contexts/modalManager.type";
import { createContext, useCallback, useState } from "react";

const ModalManagerContext = createContext({
  isOpenSelectLoginTypeModal: false,
  isOpenLocationPermissionAdviseModal: false,
  setIsOpenLocationPermissionAdviseModal: () => {},
  handleOpenSelectLoginTypeModal: () => {},
  handleCloseSelectLoginTypeModal: () => {},
  selectedLoginButton: "login",
} as ModalManagerContextType);

const ModalManagerProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpenSelectLoginTypeModal, setIsOpenSelectLoginTypeModal] =
    useState(false);
  const [
    isOpenLocationPermissionAdviseModal,
    setIsOpenLocationPermissionAdviseModal,
  ] = useState(false);
  const [selectedLoginButton, setSelectedLoginButton] =
    useState<ModalManagerContextType["selectedLoginButton"]>("login");

  const handleOpenSelectLoginTypeModal = useCallback(
    (loginType: ModalManagerContextType["selectedLoginButton"]) => {
      setSelectedLoginButton(loginType);
      setIsOpenSelectLoginTypeModal(true);
    },
    []
  );
  const handleCloseSelectLoginTypeModal = useCallback(
    () => setIsOpenSelectLoginTypeModal(false),
    []
  );

  return (
    <ModalManagerContext.Provider
      value={{
        isOpenSelectLoginTypeModal,
        isOpenLocationPermissionAdviseModal,
        setIsOpenLocationPermissionAdviseModal,
        handleOpenSelectLoginTypeModal,
        handleCloseSelectLoginTypeModal,
        selectedLoginButton,
      }}
    >
      {children}
    </ModalManagerContext.Provider>
  );
};

export { ModalManagerProvider };
export default ModalManagerContext;
