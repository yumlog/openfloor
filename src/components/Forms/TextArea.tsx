"use client";
import classNames from "classnames";
import { ChangeEvent, forwardRef, useState } from "react";
import { FieldValues, UseFormRegister } from "react-hook-form";
import Image from "next/image";

export interface InputProps extends FieldValues {
  id?: string;
  value?: string;
  type?: string;
  name?: string;
  label?: string;
  lang?: string;
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  register?: UseFormRegister<FieldValues>;
  invalid?: boolean;
  errorMessage?: string;
  onChange?: (e: ChangeEvent) => void;
  onFocus?: (e: ChangeEvent) => void;
  onBlur?: (e: ChangeEvent) => void;
  children?: React.ReactNode;
}

const TextArea = forwardRef<HTMLTextAreaElement, InputProps>(
  ({ value = "", ...props }: InputProps, ref) => {
    const [inputValue, setInputValue] = useState<string>(value);

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      setInputValue(e.target.value);
      props.onChange?.(e);
    };

    const handleReset = () => {
      setInputValue("");
    };

    return (
      <div className={`fieldset ${props.invalid && "invalid"}`}>
        <Textarea
          ref={ref}
          {...props}
          value={inputValue}
          onChange={handleChange}
        >
          {inputValue && (
            <button
              type="reset"
              onClick={handleReset}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center"
            >
              <Image
                aria-hidden
                src="/images/window.svg"
                alt="Window icon"
                width={16}
                height={16}
              />
            </button>
          )}
        </Textarea>
      </div>
    );
  }
);
TextArea.displayName = "TextArea";
export default TextArea;

const Textarea = forwardRef<HTMLTextAreaElement, InputProps>(
  ({ ...props }: InputProps, ref) => {
    const {
      id,
      value,
      label,
      type,
      invalid,
      placeholder = "입력해주세요.",
      readOnly = false,
      disabled = false,
      register,
      onChange,
      onFocus,
      onBlur,
      errorMessage,
      children,
      ...rest
    } = props;

    const classes = classNames(
      props.disabled && "disabled",
      props.readOnly && "read-only",
      props.invalid && "invalid"
    );

    return (
      <>
        {label && <label htmlFor={id}>{label}</label>}
        <div className={`text-area ${classes}`}>
          <textarea
            {...register}
            ref={ref}
            id={id}
            value={value}
            placeholder={placeholder || "입력해 주세요"}
            aria-invalid={invalid}
            readOnly={readOnly}
            disabled={disabled}
            autoComplete="off"
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            {...rest}
          />

          {children && children}
        </div>

        {invalid && (
          <p
            className={`text-xs text-red-1 mt-1 transition-all text-field-[&:not(:placeholder-shown):not(:focus):invalid]:block ${
              !invalid ? "opacity-0" : "opacity-100"
            }`}
          >
            {errorMessage}
          </p>
        )}
      </>
    );
  }
);
