/* eslint-disable no-unused-vars */
import { Dispatch, SetStateAction } from "react";

export type ModalManagerContextType = {
  isOpenInvitesModal: boolean;
  setIsOpenInvitesModal: Dispatch<SetStateAction<boolean>>;
};
