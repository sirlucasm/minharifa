"use client";
import cx from "classix";
import {
  Button as MButton,
  ButtonProps as MButtonProps,
  Spinner,
} from "@material-tailwind/react";

type ButtonProps = MButtonProps & {
  children?: React.ReactNode;
  colorVariant?: "primary" | "secondary" | "ghost" | "light";
  isLoading?: boolean;
};

const Button = ({
  children,
  colorVariant = "primary",
  isLoading,
  ...props
}: ButtonProps) => {
  return (
    <MButton
      {...(props as any)}
      variant={colorVariant === "ghost" ? "text" : "filled"}
      className={cx(
        props.className,
        colorVariant === "ghost" && "text-primary text-sm normal-case",
        colorVariant === "primary" &&
          "bg-primary text-white text-sm normal-case",
        colorVariant === "secondary" &&
          "bg-secondary text-white text-sm normal-case",
        colorVariant === "light" &&
          "bg-white text-secondary text-sm normal-case"
      )}
      disabled={isLoading}
    >
      {isLoading ? <Spinner className="mx-auto" /> : children}
    </MButton>
  );
};

export default Button;
