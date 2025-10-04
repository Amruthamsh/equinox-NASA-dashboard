import React, { useState } from "react";
import { MissionConfig } from "../components/MissionConfig";
import { MissionInsights } from "../components/MissionInsights";
import axios from "axios";

export default function MissionPlanner() {
  const [mission, setMission] = useState({
    type: "Mars",
    phase: "Planning",
    objective: "Scientific Research",
    context: "",
  });

  console.log("Current Mission State:", mission);

  const handleSubmit = () => {
    axios
      .post("http://localhost:8000/post-mission", { mission })
      .then((response) => {
        alert("Mission submitted successfully!");
        console.log("Response from server:", response.data);
      })
      .catch((error) => {
        console.error("Error submitting mission:", error);
      });
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
      <div className="flex-1 p-6 overflow-y-auto">
        <MissionInsights mission={mission} />
      </div>
    </div>
  );
}
