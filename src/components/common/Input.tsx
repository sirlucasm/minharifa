import cx from "classix";

import {
  Input as MInput,
  InputProps as MInputProps,
} from "@material-tailwind/react";

interface InputProps extends MInputProps {
  forwardRef?: React.Ref<HTMLInputElement>;
}

const Input = ({ forwardRef, ...props }: InputProps) => {
  return (
    <MInput
      {...props}
      ref={forwardRef}
      crossOrigin=""
      className={cx(
        "focus:!border-b-primary focus:border-x-primary md:self-start",
        props.className
      )}
      labelProps={{
        ...props.labelProps,
        className:
          "peer-focus:before:!border-primary peer-focus:after:!border-primary peer-focus:!text-primary peer-focus:!border-primary",
      }}
    />
  );
};

export default Input;
