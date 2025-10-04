import React from "react";

export const MissionInsights = ({ mission, insights }) => {
  const { semanticSummary, tooltips, topPapers } = insights;

  return (
    <div className="space-y-10">
      <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-6">
        Mission Insights
      </h2>

      {/* Mission Summary Card */}
      <div className="p-6 bg-gray-800 rounded-2xl shadow-xl border border-gray-700 hover:shadow-pink-500/20 transition-shadow duration-300">
        <h3 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">
          Mission Summary
        </h3>
        <div className="flex flex-col gap-3 text-gray-200">
          {/* Type */}
          <div className="flex items-center gap-2">
            <span className="font-medium w-24">Type:</span>
            <span className="flex-1">{mission.type}</span>
            {tooltips?.type && (
              <span
                title={tooltips.type}
                className="cursor-help text-gray-400 hover:text-gray-200 transition-colors"
              >
                🛈
              </span>
            )}
          </div>

          {/* Objective */}
          <div className="flex items-center gap-2">
            <span className="font-medium w-24">Objective:</span>
            <span className="flex-1">{mission.objective}</span>
            {tooltips?.objective && (
              <span
                title={tooltips.objective}
                className="cursor-help text-gray-400 hover:text-gray-200 transition-colors"
              >
                🛈
              </span>
            )}
          </div>

          {/* Phase */}
          <div className="flex items-center gap-2">
            <span className="font-medium w-24">Phase:</span>
            <span className="flex-1">{mission.phase}</span>
            {tooltips?.phase && (
              <span
                title={tooltips.phase}
                className="cursor-help text-gray-400 hover:text-gray-200 transition-colors"
              >
                🛈
              </span>
            )}
          </div>

          {/* Summary */}
          <div className="flex flex-col gap-1 mt-2">
            <span className="font-medium">Summary:</span>
            <p className="text-gray-300 whitespace-pre-line">
              {mission.summary || "No summary available."}
            </p>
          </div>
        </div>
      </div>

      {/* Relevant Publications Card */}
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
