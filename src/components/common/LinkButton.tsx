"use client";
import cx from "classix";
import Link from "next/link";
import { Button, ButtonProps, Spinner } from "@material-tailwind/react";

type LinkButtonProps = ButtonProps & {
  children?: React.ReactNode;
  colorVariant?: "primary" | "secondary" | "ghost" | "light" | "outlined";
  className?: string;
  href: string;
  isLoading?: boolean;
};

const LinkButton = ({
  children,
  colorVariant = "primary",
  isLoading,
  ...props
}: LinkButtonProps) => {
  return (
    <Link href={props.href}>
      <Button
        {...(props as any)}
        variant={colorVariant === "ghost" ? "text" : "filled"}
        className={cx(
          colorVariant === "ghost" && "text-primary text-sm normal-case",
          colorVariant === "primary" &&
            "bg-primary text-white text-sm normal-case",
          colorVariant === "secondary" &&
            "bg-secondary text-white text-sm normal-case",
          colorVariant === "light" &&
            "bg-white text-secondary text-sm normal-case",
          colorVariant === "outlined" &&
            "text-primary text-sm normal-case border-primary border-[1px]",
          props.className
        )}
      >
        {isLoading ? <Spinner className="mx-auto" /> : children}
      </Button>
    </Link>
  );
};

export default LinkButton;
