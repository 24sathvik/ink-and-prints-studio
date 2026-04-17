"use client";

import React, { InputHTMLAttributes, useState, useEffect } from "react";
import { format, parseISO, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";

interface CustomDateInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> {
  className?: string;
}

export const CustomDateInput = React.forwardRef<HTMLInputElement, CustomDateInputProps>(
  ({ className, value, defaultValue, placeholder = "dd/mm/yyyy", onChange, ...props }, ref) => {
    
    // Manage internal state for uncontrolled usage (react-hook-form)
    const [internalValue, setInternalValue] = useState<string | number | readonly string[]>(
      value !== undefined ? value : defaultValue || ""
    );

    // Sync with external value if controlled
    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);

    // Handle local change and bubble up
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) {
        setInternalValue(e.target.value);
      }
      if (onChange) {
        onChange(e);
      }
    };

    // Determine the display value securely
    let displayValue = "";
    if (internalValue && typeof internalValue === "string") {
      const parsed = parseISO(internalValue);
      if (isValid(parsed)) {
        displayValue = format(parsed, "dd/MM/yyyy");
      }
    } else if (internalValue instanceof Date && isValid(internalValue)) {
      displayValue = format(internalValue, "dd/MM/yyyy");
    }

    return (
      <div className={twMerge("relative w-full h-10 rounded-md border border-input bg-white overflow-hidden focus-within:ring-2 focus-within:ring-brand-sage transition-all", className)}>
        {/* The visual display text */}
        <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
          <span className={displayValue ? "text-sm text-brand-black font-medium" : "text-sm text-brand-muted"}>
            {displayValue || placeholder}
          </span>
          <CalendarIcon className="w-4 h-4 text-brand-muted" />
        </div>
        
        {/* The invisible native date input that triggers the OS/Browser picker */}
        <input
          type="date"
          {...props}
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          onClick={(e) => {
            try {
              if ("showPicker" in e.currentTarget) {
                (e.currentTarget as any).showPicker();
              }
            } catch (err) {
              // Ignore
            }
            if (props.onClick) {
              props.onClick(e);
            }
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    );
  }
);

CustomDateInput.displayName = "CustomDateInput";
