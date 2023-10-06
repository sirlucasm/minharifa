/* eslint-disable react/display-name */
import React from "react";

import cx from "classix";

import {
  Input as MInput,
  InputProps as MInputProps,
} from "@material-tailwind/react";

interface InputProps extends MInputProps {
  forwardRef?: React.Ref<HTMLInputElement>;
}

const Input = React.forwardRef(({ ...props }: InputProps, ref) => {
  return (
    <MInput
      ref={ref as any}
      {...props}
      crossOrigin=""
      className={cx(
        "focus:!border-b-primary focus:border-x-primary md:self-start",
        props.className
      )}
      labelProps={{
        ...props.labelProps,
        className: cx(
          "peer-focus:before:!border-primary peer-focus:after:!border-primary peer-focus:!text-primary peer-focus:!border-primary",
          props.labelProps?.className
        ),
      }}
    />
  );
});

export default Input;
