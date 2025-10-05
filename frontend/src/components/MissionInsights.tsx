import React from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "./ui/button";
import { CopyButton } from "./CopyButton";

export const MissionInsights = ({
  mission,
  insights,
  ExportMissionDetailsAsPdf,
  loadingPdf,
}) => {
  const { missionInsight, tooltips, topPapers } = insights;

  return (
    <div className="space-y-10">
      <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-6">
        Mission Insights
      </h2>

      {/* Mission Summary */}
      <div className="p-6 bg-gray-800 rounded-2xl shadow-xl border border-gray-700 hover:shadow-pink-500/20 transition-shadow duration-300">
        <h3 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">
          Mission Summary
        </h3>
        <div className="flex flex-col gap-3 text-gray-200">
          {["type", "objective", "phase"].map((field) => (
            <div key={field} className="flex items-center gap-2">
              <span className="font-bold w-24">
                {field.charAt(0).toUpperCase() + field.slice(1)}:
              </span>
              <span className="flex-1">{mission[field]}</span>
              {tooltips?.[field] && (
                <span
                  title={tooltips[field]}
                  className="cursor-help text-gray-400 hover:text-gray-200 transition-colors"
                >
                  🛈
                </span>
              )}
            </div>
          ))}

          <div className="flex flex-col gap-1 mt-2">
            <span className="font-bold">Summary:</span>
            <p className="text-gray-300 whitespace-pre-line">
              {mission.summary || "No summary available."}
            </p>
          </div>
        </div>
      </div>

      {/* Learnings */}
      <div className="p-6 bg-gray-800 rounded-2xl shadow-xl border border-gray-700 hover:shadow-purple-500/20 transition-shadow duration-300">
        <h3 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">
          Learnings from Research
        </h3>
        {missionInsight ? (
          <div className="text-gray-200">
            <ReactMarkdown>{missionInsight}</ReactMarkdown>
            <div className="flex flex-row justify-end gap-4 mt-4">
              <CopyButton textToCopy={missionInsight} />
              <Button
                onClick={ExportMissionDetailsAsPdf}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {loadingPdf ? "Generating PDF..." : "Export as PDF"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-400">No learnings from research available.</p>
        )}
      </div>

      {/* Publications */}
      <div className="p-6 bg-gray-800 rounded-2xl shadow-xl border border-gray-700 hover:shadow-blue-500/20 transition-shadow duration-300">
        <h3 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">
          Relevant Publications
        </h3>
        <ul className="space-y-2 text-gray-200">
          {topPapers.length > 0 ? (
            topPapers.map((pub, idx) => (
              <li
                key={idx}
                className="p-3 bg-gray-700 rounded-lg hover:bg-gray-700/80 transition-colors flex justify-between items-center"
              >
                <a
                  href={pub.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  {pub.title}
                </a>
                <span className="text-gray-300 text-sm">
                  {(pub.similarity * 100).toFixed(1)}%
                </span>
              </li>
            ))
          ) : (
            <li className="text-gray-400 italic">No relevant papers found.</li>
          )}
        </ul>
      </div>
    </div>
  );
};
