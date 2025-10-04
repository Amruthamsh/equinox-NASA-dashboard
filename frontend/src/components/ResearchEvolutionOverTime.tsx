import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCw } from "lucide-react"; // pretty icon

const data = [
  {
    year: 2015,
    Biology: 12,
    Medicine: 5,
    Psychology: 3,
    Radiation: 2,
    Tech: 1,
    Botany: 4,
    SpaceFood: 3,
    Microbe: 2,
    Genetics: 1,
  },
  {
    year: 2016,
    Biology: 15,
    Medicine: 7,
    Psychology: 5,
    Radiation: 3,
    Tech: 2,
    Botany: 5,
    SpaceFood: 4,
    Microbe: 3,
    Genetics: 2,
  },
  {
    year: 2017,
    Biology: 18,
    Medicine: 9,
    Psychology: 6,
    Radiation: 4,
    Tech: 3,
    Botany: 6,
    SpaceFood: 5,
    Microbe: 3,
    Genetics: 2,
  },
  {
    year: 2018,
    Biology: 20,
    Medicine: 11,
    Psychology: 7,
    Radiation: 5,
    Tech: 4,
    Botany: 7,
    SpaceFood: 6,
    Microbe: 4,
    Genetics: 3,
  },
  {
    year: 2019,
    Biology: 22,
    Medicine: 13,
    Psychology: 8,
    Radiation: 6,
    Tech: 5,
    Botany: 8,
    SpaceFood: 7,
    Microbe: 5,
    Genetics: 4,
  },
  {
    year: 2020,
    Biology: 25,
    Medicine: 15,
    Psychology: 9,
    Radiation: 7,
    Tech: 6,
    Botany: 9,
    SpaceFood: 8,
    Microbe: 5,
    Genetics: 5,
  },
  {
    year: 2021,
    Biology: 27,
    Medicine: 18,
    Psychology: 10,
    Radiation: 8,
    Tech: 7,
    Botany: 10,
    SpaceFood: 9,
    Microbe: 6,
    Genetics: 6,
  },
  {
    year: 2021,
    Biology: 27,
    Medicine: 18,
    Psychology: 10,
    Radiation: 8,
    Tech: 7,
    Botany: 10,
    SpaceFood: 9,
    Microbe: 6,
    Genetics: 6,
  },
  {
    year: 2021,
    Biology: 27,
    Medicine: 18,
    Psychology: 10,
    Radiation: 8,
    Tech: 7,
    Botany: 10,
    SpaceFood: 9,
    Microbe: 6,
    Genetics: 6,
  },
  {
    year: 2021,
    Biology: 27,
    Medicine: 18,
    Psychology: 10,
    Radiation: 8,
    Tech: 7,
    Botany: 10,
    SpaceFood: 9,
    Microbe: 6,
    Genetics: 6,
  },
  {
    year: 2021,
    Biology: 27,
    Medicine: 18,
    Psychology: 10,
    Radiation: 8,
    Tech: 7,
    Botany: 10,
    SpaceFood: 9,
    Microbe: 6,
    Genetics: 6,
  },
  {
    year: 2021,
    Biology: 27,
    Medicine: 18,
    Psychology: 10,
    Radiation: 8,
    Tech: 7,
    Botany: 10,
    SpaceFood: 9,
    Microbe: 6,
    Genetics: 6,
  },
  {
    year: 2021,
    Biology: 27,
    Medicine: 18,
    Psychology: 10,
    Radiation: 8,
    Tech: 7,
    Botany: 10,
    SpaceFood: 9,
    Microbe: 6,
    Genetics: 6,
  },
  {
    year: 2021,
    Biology: 27,
    Medicine: 18,
    Psychology: 10,
    Radiation: 8,
    Tech: 7,
    Botany: 10,
    SpaceFood: 9,
    Microbe: 6,
    Genetics: 6,
  },
  {
    year: 2021,
    Biology: 27,
    Medicine: 18,
    Psychology: 10,
    Radiation: 8,
    Tech: 7,
    Botany: 10,
    SpaceFood: 9,
    Microbe: 6,
    Genetics: 6,
  },
];

const categories = [
  "Biology",
  "Medicine",
  "Psychology",
  "Radiation",
  "Tech",
  "Botany",
  "SpaceFood",
  "Microbe",
  "Genetics",
];

const colors = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
  "#00FF99",
  "#FF00CC",
  "#00FFFF",
];

export default function ResearchEvolutionChart() {
  const [selectedCategories, setSelectedCategories] = useState(categories);
  const [activeTab, setActiveTab] = useState("SUMMARY");

  const handleLegendClick = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleRefresh = () => {
    // Reset all categories + trigger re-render animation
    setSelectedCategories([]);
    setTimeout(() => setSelectedCategories(categories), 150);
  };

  const TabContent = {
    SUMMARY:
      "AI Summary: Biology and Medicine have shown consistent growth. Radiation and Microbe studies are emerging focus areas since 2017.",
    OUTLIER:
      "Outlier Detection: Genetics research spiked in 2021 due to renewed human adaptation studies.",
    INSIGHT:
      "Insight: SpaceFood and Botany show strong correlation — indicating potential in bio-regenerative life support systems.",
    "ASK NEW QUESTION":
      "Ask AI: Which research categories best prepare for long-duration Mars missions? Generate insights and projections.",
  };

  return (
    <div className="bg-[#0a0a1a] text-white p-8 rounded-2xl shadow-lg border border-purple-700/40">
      {/* Title */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
          Research Category Evolution Over Time
        </h2>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium shadow-md transition-all"
        >
          <RotateCw size={16} />
          Refresh
        </button>
      </div>

      <div className="flex space-x-6">
        {/* Chart Section */}
        <div className="w-2/3 bg-[#111122] p-4 rounded-xl shadow-inner">
          <ResponsiveContainer
            key={selectedCategories.join(",")}
            width="100%"
            height={400}
          >
            <LineChart
              data={data}
              margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid stroke="#2c2c2c" strokeDasharray="3 3" />
              <XAxis dataKey="year" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f1f1f",
                  border: "none",
                  color: "#fff",
                }}
              />
              <Legend
                wrapperStyle={{ color: "#fff", cursor: "pointer" }}
                onClick={(e: any) => handleLegendClick(e.value)}
              />
              {categories.map(
                (cat, idx) =>
                  selectedCategories.includes(cat) && (
                    <Line
                      key={cat}
                      type="basis" // smoother curve
                      dataKey={cat}
                      stroke={colors[idx]}
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6 }}
                      isAnimationActive={true}
                      animationDuration={600}
                    />
                  )
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tab Panel */}
        <div className="w-1/3 bg-[#151530] rounded-xl p-4 shadow-lg flex flex-col border border-purple-700/30">
          {/* Tabs */}
          <div className="flex mb-3 space-x-2">
            {Object.keys(TabContent).map((tab) => (
              <button
                key={tab}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "bg-gray-800 text-gray-300 hover:bg-purple-500/40 hover:text-white"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto text-gray-200 p-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-base leading-relaxed">
                  {TabContent[activeTab]}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
