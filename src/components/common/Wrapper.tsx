import cx from "classix";

type WrapperProps = React.HTMLAttributes<HTMLElement> & {
  children: React.ReactNode;
  as?: "main" | "section" | "div" | "footer" | "header";
};

export const Wrapper = ({
  children,
  as = "div",
  className,
  ...props
}: WrapperProps) => {
  const Tag = as;
  return (
    <Tag
      className={cx(
        className,
        "px-6 mx-auto max-w-screen-sm w-full md:max-w-screen-sl md:px-24"
      )}
      {...props}
    >
      {children}
    </Tag>
  );
};
