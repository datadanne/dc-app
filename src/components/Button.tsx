import React from "react";
import { twMerge } from "tailwind-merge";
import Loader from "./Loader";

export interface ButtonProps {
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export default function Button({
  children,
  disabled,
  loading,
  className,
  onClick,
}: React.PropsWithChildren<ButtonProps>) {
  return (
    <button
      type="button"
      className={twMerge(
        "inline-flex items-center px-4 py-2 font-semibold leading-6 text-lg shadow rounded-md text-black bg-violet-500 hover:bg-violet-600 font-normal transition ease-in-out duration-150 h-10",
        (disabled || loading) && "cursor-not-allowed",
        className
      )}
      onClick={onClick}
    >
      {loading && <Loader className="text-white w-4 h-4" />}

      <span>{children}</span>
    </button>
  );
};
