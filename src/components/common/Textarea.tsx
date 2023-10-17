/* eslint-disable react/display-name */
import React from "react";

import cx from "classix";

import {
  Textarea as MTextarea,
  TextareaProps as MTextareaProps,
} from "@material-tailwind/react";

interface TextareaProps extends MTextareaProps {
  forwardRef?: React.Ref<HTMLTextAreaElement>;
}

const Textarea = React.forwardRef(({ ...props }: TextareaProps, ref) => {
  return (
    <MTextarea
      ref={ref as any}
      {...props}
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

export default Textarea;
