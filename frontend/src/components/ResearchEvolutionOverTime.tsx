import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = [
  "#4ADE80", // Green – growth / biology
  "#60A5FA", // Blue – calm / tech
  "#FACC15", // Yellow – highlight / star
  "#F472B6", // Pink – accent / rare
  "#FB923C", // Orange – warning / outlier
  "#A78BFA", // Purple – subtle / sophisticated
  "#F87171", // Red – alert / important
  "#34D399", // Mint – secondary highlight
  "#38BDF8", // Light blue – secondary accent
];

const TabContent = {
  SUMMARY:
    "AI Summary: Biology and Medicine have shown consistent growth. Radiation and Microbe studies are emerging focus areas since 2017.",
  OUTLIER:
    "Outlier Detection: Genetics research spiked in 2021 due to renewed human adaptation studies.",
  INSIGHT:
    "Insight: SpaceFood and Botany show strong correlation — indicating potential in bio-regenerative life support systems.",
  "ASK AI":
    "Ask AI: Which research categories best prepare for long-duration Mars missions? Generate insights and projections.",
};

export default function ResearchEvolutionChart() {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategories, setActiveCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("SUMMARY");

  useEffect(() => {
    axios.get("http://localhost:8000/research-evolution").then((res) => {
      const raw = res.data;

      setData(raw);

      // Extract category names dynamically (all keys except 'year')
      const cats = raw.length
        ? Object.keys(raw[0]).filter((k) => k !== "year")
        : [];
      setCategories(cats);
      setActiveCategories(cats);
    });
  }, []);

  const toggleCategory = (cat) => {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleRefresh = () => {
    setActiveCategories([]); // reset
    setTimeout(() => setActiveCategories(categories), 150);
  };

  return (
    <div className="bg-gray-900 text-white p-4 rounded-2xl shadow-lg flex space-x-6">
      {/* Chart */}
      <div className="w-3/4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
            Research Category Evolution Over Time
          </h2>
          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium shadow-md flex items-center gap-2"
          >
            Refresh
          </button>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="year" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip contentStyle={{ backgroundColor: "#222" }} />
            <Legend
              onClick={(e) => toggleCategory(e.value)}
              wrapperStyle={{ cursor: "pointer" }}
            />
            {categories.map(
              (cat, i) =>
                activeCategories.includes(cat) && (
                  <Line
                    key={cat}
                    type="monotone"
                    dataKey={cat}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                )
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tab Panel */}
      <div className="w-1/4 bg-[#151530] rounded-xl p-4 shadow-lg flex flex-col border border-purple-700/30">
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
              {tab.toUpperCase()}
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
              <p className="text-sm leading-relaxed">{TabContent[activeTab]}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
