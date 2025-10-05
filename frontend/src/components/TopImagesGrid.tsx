import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

const TopImagesGrid = ({ topImages }) => {
  const [expanded, setExpanded] = useState({}); // Track which images are expanded

  const toggleExpand = (idx) => {
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const previewLength = 200; // Number of chars to show before "show more"

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {topImages.map((img, idx) => {
        const isExpanded = expanded[idx];
        const hasLongDescription =
          img.description && img.description.length > previewLength;
        const displayText = hasLongDescription
          ? isExpanded
            ? img.description
            : img.description.slice(0, previewLength) + "..."
          : img.description;

        return (
          <div
            key={idx}
            className="rounded-xl overflow-hidden shadow-lg hover:shadow-purple-400/60 transition-shadow duration-300 p-8"
          >
            <img
              src={`http://localhost:8000${img.image}`}
              alt={img.caption || `Image ${idx + 1}`}
              className="w-full h-48 object-contain"
            />
            <div className="py-3 text-gray-200 text-sm">
              {img.caption && <p className="font-semibold">{img.caption}</p>}
            </div>
            {img.description && (
              <div className="text-gray-200 text-sm">
                <h3 className="font-semibold text-purple-300 text-lg pb-4">
                  Insights from Figure:{" "}
                </h3>
                <ReactMarkdown>{displayText}</ReactMarkdown>
                {hasLongDescription && (
                  <button
                    onClick={() => toggleExpand(idx)}
                    className="text-blue-400 hover:text-blue-300 font-medium mt-1"
                  >
                    {isExpanded ? "Show Less" : "Show More"}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TopImagesGrid;
