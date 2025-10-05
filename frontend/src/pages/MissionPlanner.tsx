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
  const [loadingPdf, setLoadingPdf] = useState(false);

  const handleSubmit = () => {
    setLoading(true);

    axios
      .post("http://localhost:8000/post-mission", { mission })
      .then((response) => {
        const data = response.data;

        // Update mission with returned fields
        setMission((prev) => ({
          ...prev,
          ...data.mission,
          summary: data.mission.summary || "",
          additionalContext: data.mission.additionalContext || "",
        }));

        // Update insights
        setInsights({
          missionInsight: data.mission_insight || "",
          tooltips: data.tooltips || {},
          topPapers: data.top_papers || [],
        });
      })
      .catch((error) => {
        console.error("Error submitting mission:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Export PDF function
  const handleExportPdf = async () => {
    setLoadingPdf(true);
    try {
      const payload = {
        mission, // { type, phase, objective, summary, additionalContext }
        insights: {
          missionInsight: insights.missionInsight || "",
        },
        topPapers: insights.topPapers || [],
        tooltips: insights.tooltips || {},
      };

      console.log("Generating PDF with payload:", payload);

      const response = await axios.post(
        "http://localhost:8000/generate-pdf",
        payload,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "mission-details.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans">
      {/* Left Panel */}
      <div className="w-1/3 p-6 bg-gray-800 border-r border-gray-700 overflow-y-auto">
        <MissionConfig
          mission={mission}
          setMission={setMission}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>

      {/* Right Panel */}
      <div className="flex-1 p-6 overflow-y-auto relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
            <span className="text-white">Loading...</span>
          </div>
        )}
        <MissionInsights
          mission={mission}
          insights={insights}
          ExportMissionDetailsAsPdf={handleExportPdf}
          loadingPdf={loadingPdf}
        />
      </div>
    </div>
  );
}
