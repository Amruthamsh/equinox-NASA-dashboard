import React, { useState } from "react";
import { Button } from "./ui/button";

export const CopyButton = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // reset after 2 seconds
  };

  return (
    <Button
      className={`${copied ? "bg-green-500" : "bg-blue-600"} hover:${
        copied ? "bg-green-600" : "bg-blue-700"
      } text-white px-4 py-2 transition-colors duration-200`}
      onClick={handleCopy}
    >
      {copied ? "Copied!" : "Copy"}
    </Button>
  );
};
