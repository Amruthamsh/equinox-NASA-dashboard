import React, { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

export function Collapse({ title, children, className }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`border border-gray-600 rounded-md p-2 ${className}`}>
      <button
        className="flex justify-between w-full text-left font-medium hover:text-purple-400"
        onClick={() => setOpen(!open)}
      >
        {title}
        {open ? (
          <ChevronUpIcon className="w-4 h-4" />
        ) : (
          <ChevronDownIcon className="w-4 h-4" />
        )}
      </button>
      {open && <div className="mt-2 text-sm text-gray-200">{children}</div>}
    </div>
  );
}
