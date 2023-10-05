import cx from "classix";

interface DividerProps extends React.ComponentProps<"div"> {
  direction?: "horizontal" | "vertical";
}

const Divider = ({ direction = "horizontal", ...props }: DividerProps) => {
  return (
    <div
      {...props}
      className={cx(
        props.className,
        direction === "horizontal" && "w-full h-[1px] bg-gray-light my-4",
        direction === "vertical" && "w-[1px] h-full bg-gray-light my-4"
      )}
    />
  );
};

export default Divider;
