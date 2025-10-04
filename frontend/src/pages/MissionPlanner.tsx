import React, { useState } from "react";
import { MissionConfig } from "../components/MissionConfig";
import { MissionInsights } from "../components/MissionInsights";
import axios from "axios";

export default function MissionPlanner() {
  const [mission, setMission] = useState({
    type: "Mars",
    phase: "Planning",
    objective: "Scientific Research",
    summary: "",
    additionalContext: "",
  });

  const [insights, setInsights] = useState({
    missionInsight: "",
    topPapers: [],
    tooltips: {},
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);

    axios
      .post("http://localhost:8000/post-mission", { mission })
      .then((response) => {
        console.log("Response from server:", response.data);

        const data = response.data;

        // Update mission with any returned fields
        setMission((prev) => ({
          ...prev,
          ...data.mission,
          summary: data.mission.summary || "",
          additionalContext: data.mission.additionalContext || "",
        }));

        // Update insights with mission insight, tooltips, and top papers
        setInsights({
          missionInsight: data.mission_insight,
          tooltips: data.tooltips,
          topPapers: data.top_papers,
        });
      })
      .catch((error) => {
        console.error("Error submitting mission:", error);
      });

    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans">
      {/* Left Panel */}
      <div className="w-1/3 p-6 bg-gray-800 border-r border-gray-700 overflow-y-auto">
        <MissionConfig
          mission={mission}
          setMission={setMission}
          onSubmit={handleSubmit}
        />
      </div>

      {/* Right Panel */}
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
          <span className="text-white">Loading...</span>
        </div>
      ) : (
        <div className="flex-1 p-6 overflow-y-auto">
          <MissionInsights mission={mission} insights={insights} />
        </div>
      )}
    </div>
  );
}
