import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputWithAddonsProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  containerClassName?: string;
}

const InputWithAddons = React.forwardRef<
  HTMLInputElement,
  InputWithAddonsProps
>(({ leading, trailing, containerClassName, className, ...props }, ref) => {
  return (
    <div
      className={cn(
        "group border-input ring-offset-background focus-within:ring-ring flex h-10 w-full overflow-hidden rounded-md border bg-transparent text-sm focus-within:ring-2 focus-within:ring-offset-2 focus-within:outline-hidden",
        containerClassName
      )}
    >
      {leading ? (
        <div className="border-input bg-muted border-r px-2 py-2">
          {leading}
        </div>
      ) : null}
      <input
        className={cn(
          "bg-background placeholder:text-muted-foreground w-full rounded-md px-3 py-2 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-inner-spin-button]:appearance-none",
          className
        )}
        ref={ref}
        {...props}
      />
      {trailing ? (
        <div className="border-input bg-muted border-l px-1 py-2">
          {trailing}
        </div>
      ) : null}
    </div>
  );
});
InputWithAddons.displayName = "InputWithAddons";

export { InputWithAddons };
