"use client";

import React, { ChangeEvent, useEffect, useState } from "react";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

interface InputCustProps<T> {
  firstValue?: string;
  placeholder?: string;
  title?: string;
  name: string;
  setAllValues: React.Dispatch<React.SetStateAction<T>>;
  error?: boolean;
  isPassword?: boolean;
  inputStyle?: number;
}

export default function InputCust<T>({
  firstValue,
  placeholder,
  title,
  name,
  setAllValues,
  error,
  isPassword,
  inputStyle,
}: InputCustProps<T>) {
  const [isFocused, setIsFocused] = useState(false);

  const [show, setshow] = useState(false);
  const handleshow = () => {
    setshow((pre) => !pre);
  };

  const [inputText, setInputText] = useState<string>("");

  useEffect(() => {
    if (setAllValues) {
      setAllValues((prev) => ({
        ...prev,
        [name]: inputText,
      }));
    }
  }, [inputText]);

  useEffect(() => {
    setInputText(firstValue ?? "");
  }, [firstValue]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    let newText = event.target.value;

    setInputText(newText);
    if (setAllValues) {
      setAllValues((prev) => ({ ...prev, [name]: newText }));
    }
  };

  return (
    <div className="flex flex-col gap-y-[5px] w-full">
      {inputStyle == 2 && <p className="text-white">{title}</p>}
      <div
        className={`w-full flex duration-100 border-[1px] px-[10px] ${
          inputStyle == 2 && "h-[40px] rounded-[8px]"
        } ${
          error
            ? "border-[red]"
            : isFocused
            ? `${inputStyle == 2 && "bg-[#eeeeeeb5]"} border-[#E2E2E2]`
            : `${
                inputStyle == 1 ? "bg-[#EEEEEE]" : "bg-white"
              } border-[#E2E2E2]`
        }`}
      >
        <input
          onChange={handleInputChange}
          value={inputText}
          type={isPassword ? (show ? "text" : "password") : "text"}
          name={name}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`select-none outline-none text-[14px] bg-transparent ${
            show ? "w-[calc(100%-20px)]" : "w-full"
          }`}
        />
        {isPassword && (
          <div
            onClick={handleshow}
            className={`text-[20px] flex items-center justify-center cursor-pointer ${
              !show && "text-gray-600"
            }`}
          >
            {show ? <RemoveRedEyeIcon /> : <VisibilityOffIcon />}
          </div>
        )}
      </div>
    </div>
  );
}
