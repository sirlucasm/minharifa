"use client";

import Image from "next/image";
import Link from "next/link";

import cx from "classix";
import useAuth from "@/hooks/useAuth";
import LogoImage from "@/assets/images/logo.svg?url";

import { Wrapper } from "@/components/common/Wrapper";
import Profile from "./Profile";
import routes from "@/routes";

type HeaderProps = {
  variants?: "ghost" | "light" | "dark" | "primary" | "secondary";
};

const AppHeader = ({ variants }: HeaderProps) => {
  const { currentUser } = useAuth();

  return (
    <header
      className={cx(
        variants === "ghost" && "bg-transparent",
        variants === "light" && "bg-white shadow-lg",
        variants === "primary" && "bg-primary shadow-lg",
        variants === "secondary" && "bg-secondary shadow-lg",
        variants === "dark" && "bg-gray-dark shadow-lg"
      )}
    >
      <Wrapper className={cx("flex items-center justify-between py-3.5")}>
        <Link
          href={currentUser ? routes.private.home : routes.public.login}
          className="flex items-center"
        >
          <Image
            priority
            src={LogoImage}
            alt="Logo primary"
            width={160}
            className=""
          />
        </Link>
        <div className="flex items-center gap-6">
          <Profile currentUser={currentUser} />
        </div>
      </Wrapper>
    </header>
  );
};

export default AppHeader;
