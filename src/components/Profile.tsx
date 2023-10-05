import Image from "next/image";

import MenuIcon from "@/assets/icons/profile.svg?url";
import useDrawerManager from "@/hooks/useDrawerManager";
import { AuthenticatedUserType } from "@/@types/user.type";

import Button from "./common/Button";
import AppDrawerMenu from "./AppDrawerMenu";
import { useCallback } from "react";

interface ProfileProps {
  currentUser: AuthenticatedUserType | undefined;
}

const Profile = ({ currentUser }: ProfileProps) => {
  const { setIsOpenProfileDrawer, isOpenProfileDrawer } = useDrawerManager();

  const handleOpenDrawer = useCallback(() => {
    setIsOpenProfileDrawer(true);
  }, [setIsOpenProfileDrawer]);

  return (
    <>
      <Button
        colorVariant="ghost"
        className="rounded-full bg-zinc-100 p-4"
        onClick={handleOpenDrawer}
      >
        <Image
          priority
          src={currentUser?.profileImageUrl || MenuIcon}
          alt="Profile image"
          className="w-5"
        />
      </Button>
      <AppDrawerMenu
        open={isOpenProfileDrawer}
        setOpen={setIsOpenProfileDrawer}
        currentUser={currentUser}
      />
    </>
  );
};

export default Profile;
