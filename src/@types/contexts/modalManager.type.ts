/* eslint-disable no-unused-vars */
import { Dispatch, SetStateAction } from "react";

export type ModalManagerContextType = {
  isOpenSelectLoginTypeModal: boolean;
  isOpenLocationPermissionAdviseModal: boolean;
  setIsOpenLocationPermissionAdviseModal: Dispatch<SetStateAction<boolean>>;
  handleOpenSelectLoginTypeModal(
    loginType: ModalManagerContextType["selectedLoginButton"]
  ): void;
  handleCloseSelectLoginTypeModal(): void;
  selectedLoginButton: "login" | "register";
};
