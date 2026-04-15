"use client";

import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";

interface CreatableComboboxProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  error?: boolean;
}

export function CreatableCombobox({
  value,
  onChange,
  options,
  placeholder = "Select or type...",
  error,
}: CreatableComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase())
  );
  const exactMatch = options.some(
    (o) => o.toLowerCase() === query.toLowerCase()
  );

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between h-10 w-full rounded-md border bg-white px-3 py-2 text-sm cursor-pointer transition-all ${
          open ? "ring-2 ring-brand-sage border-transparent" : ""
        } ${
          error
            ? "border-brand-danger ring-1 ring-brand-danger"
            : "border-input hover:border-brand-sage"
        }`}
      >
        <span className={value ? "text-brand-black font-medium" : "text-brand-muted"}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-brand-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-brand-border rounded-md shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 border-b border-brand-border bg-brand-cream/30">
            <input
              autoFocus
              className="w-full h-9 px-3 text-sm bg-white border border-brand-border outline-none rounded focus:border-brand-sage focus:ring-1 focus:ring-brand-sage transition-colors placeholder:text-brand-muted"
              placeholder="Search or type new..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query && !exactMatch) {
                  e.preventDefault();
                  onChange(query);
                  setOpen(false);
                  setQuery("");
                }
              }}
            />
          </div>

          <ul className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
            {/* Clear option */}
            <li
              onClick={() => { onChange(""); setOpen(false); setQuery(""); }}
              className="flex items-center px-3 py-2 text-sm rounded-md cursor-pointer text-brand-muted italic hover:bg-brand-cream transition-colors"
            >
              — None —
            </li>

            {filtered.map((option) => (
              <li
                key={option}
                onClick={() => { onChange(option); setOpen(false); setQuery(""); }}
                className={`flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer transition-colors hover:bg-brand-cream ${
                  value === option
                    ? "bg-brand-cream font-semibold text-brand-forest"
                    : "font-medium text-brand-black"
                }`}
              >
                {option}
                {value === option && <Check className="w-4 h-4 text-brand-forest" />}
              </li>
            ))}

            {query && !exactMatch && (
              <li
                onClick={() => { onChange(query); setOpen(false); setQuery(""); }}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer bg-brand-forest/5 hover:bg-brand-forest hover:text-white text-brand-forest font-semibold mt-1 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add &quot;{query}&quot;
              </li>
            )}

            {filtered.length === 0 && !query && (
              <li className="px-3 py-4 text-sm text-center text-brand-muted">
                No options found.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
