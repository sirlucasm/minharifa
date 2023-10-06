/* eslint-disable react/display-name */
import React from "react";

import cx from "classix";

import {
  Select as MSelect,
  SelectProps as MSelectProps,
} from "@material-tailwind/react";

interface SelectProps extends MSelectProps {
  forwardRef?: React.Ref<HTMLInputElement>;
}

const Select = React.forwardRef(({ ...props }: SelectProps, ref) => {
  return (
    <MSelect
      ref={ref as any}
      {...props}
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
});

export default Select;
