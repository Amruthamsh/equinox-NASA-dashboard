import React from "react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

const publications = [
  { title: "Mars Colonization Blueprint", year: 2023 },
  { title: "NASA Moon to Mars Strategy", year: 2022 },
  { title: "Low-Cost Mars Science Missions", year: 2021 },
];

const mindMapData = [
  { name: "Propulsion", value: 8 },
  { name: "Life Support", value: 6 },
  { name: "Habitat", value: 4 },
  { name: "Science Instruments", value: 7 },
  { name: "Communication", value: 5 },
];

export const MissionInsights = ({ mission }) => {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-4">Mission Insights</h2>

      {/* Mission Summary */}
      <div className="p-4 bg-gray-800 rounded-md">
        <h3 className="text-xl font-semibold mb-2">Summary</h3>
        <p>
          Mission Type: <strong>{mission.type}</strong> <br />
          Phase: <strong>{mission.phase}</strong> <br />
          Objective: <strong>{mission.objective}</strong> <br />
          Context: <strong>{mission.context || "None"}</strong>
        </p>
      </div>

      {/* Publications */}
      <div className="p-4 bg-gray-800 rounded-md">
        <h3 className="text-xl font-semibold mb-2">Relevant Publications</h3>
        <ul className="list-disc list-inside space-y-1">
          {publications.map((pub, idx) => (
            <li key={idx}>
              {pub.title} ({pub.year})
            </li>
          ))}
        </ul>
      </div>

      {/* Mind Map / Chart */}
      <div className="p-4 bg-gray-800 rounded-md h-64">
        <h3 className="text-xl font-semibold mb-2">Mission Mind Map</h3>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={mindMapData}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid stroke="#444" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#4ade80" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
