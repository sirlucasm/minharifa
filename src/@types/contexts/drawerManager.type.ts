import { Dispatch, SetStateAction } from "react";

export type DrawerManagerContextType = {
  isOpenProfileDrawer: boolean;
  setIsOpenProfileDrawer: Dispatch<SetStateAction<boolean>>;
};
