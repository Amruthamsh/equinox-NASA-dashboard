import React, { useState } from "react";
import { MissionConfig } from "../components/MissionConfig";
import { MissionInsights } from "../components/MissionInsights";

export default function MissionPlanner() {
  const [mission, setMission] = useState({
    type: "Mars",
    phase: "Planning",
    objective: "Scientific Research",
    context: "",
  });

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans">
      {/* Left Panel */}
      <div className="w-1/3 p-6 bg-gray-800 border-r border-gray-700 overflow-y-auto">
        <MissionConfig mission={mission} setMission={setMission} />
      </div>

      {/* Right Panel */}
      <div className="flex-1 p-6 overflow-y-auto">
        <MissionInsights mission={mission} />
      </div>
    </div>
  );
}
