import React from "react";
import { useController } from "react-hook-form";
import { AutoFormFieldProps } from "@autoform/react";
import {
  NumberInputField,
  NumberInputRoot,
} from "../ui/number-input";

export const NumberField: React.FC<AutoFormFieldProps> = ({
  id,
  inputProps,
}) => {
  const { key, onChange, ...props } = inputProps;
  const { field } = useController({ name: id });

  return (
    <NumberInputRoot
      key={key}
      onValueChange={({ value }: { value: string }) => {
        field.onChange(value);
      }}
      w={"full"}
    >
      <NumberInputField {...props} />
    </NumberInputRoot>
  );
};
