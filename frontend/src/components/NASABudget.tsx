import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  Legend,
  CartesianGrid,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = [
  "#4ADE80",
  "#60A5FA",
  "#FACC15",
  "#F472B6",
  "#FB923C",
  "#A78BFA",
  "#F87171",
  "#34D399",
  "#38BDF8",
  "#E879F9",
  "#FBBF24",
  "#22D3EE",
];

export default function NasaBudgetHeatmap() {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategories, setActiveCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("SUMMARY");
  const [tabContent, setTabContent] = useState({});
  const [askQuestion, setAskQuestion] = useState("");
  const [askAnswer, setAskAnswer] = useState("");

  useEffect(() => {
    axios.get("http://localhost:8000/nasa-budget").then((res) => {
      // Convert all category values to billions
      const raw = res.data.map((row) => {
        const newRow = { ...row };
        Object.keys(newRow).forEach((k) => {
          if (
            k !== "Year" &&
            k !== "Total Budget" &&
            k !== "Key Milestone" &&
            k !== "Description" &&
            k !== "Deviation"
          ) {
            newRow[k] = Number(newRow[k]) / 1000; // convert to billions
          }
        });
        if (newRow["Total Budget"])
          newRow["Total Budget"] = newRow["Total Budget"] / 1000;
        return newRow;
      });

      setData(raw);

      const cats = raw.length
        ? Object.keys(raw[0]).filter(
            (k) =>
              k !== "Year" &&
              k !== "Total Budget" &&
              k !== "Key Milestone" &&
              k !== "Description" &&
              k !== "Deviation"
          )
        : [];
      setCategories(cats);
      setActiveCategories(cats);
    });
  }, []);

  useEffect(() => {
    const storedTabs = localStorage.getItem("aiTabs_NasaBudget");
    if (storedTabs) {
      setTabContent(JSON.parse(storedTabs));
    } else {
      axios
        .get("http://localhost:8000/ai-tabs?dataset=nasa-budget")
        .then((res) => {
          setTabContent(res.data);
          localStorage.setItem("aiTabs_NasaBudget", JSON.stringify(res.data));
        });
    }
  }, []);

  const handleAskAI = async () => {
    if (!askQuestion.trim()) return;

    const storedAnswers = JSON.parse(
      localStorage.getItem("askAI_NasaBudget") || "{}"
    );
    if (storedAnswers[askQuestion]) {
      setAskAnswer(storedAnswers[askQuestion]);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/ask-ai?dataset=nasa-budget",
        {
          question: askQuestion,
          df_summary: tabContent.SUMMARY || "",
        }
      );
      const answer = response.data.answer;
      setAskAnswer(answer);

      const updatedAnswers = { ...storedAnswers, [askQuestion]: answer };
      localStorage.setItem("askAI_NasaBudget", JSON.stringify(updatedAnswers));
    } catch (err) {
      console.error(err);
      setAskAnswer("Error fetching AI answer.");
    }
  };

  const toggleCategory = (cat) => {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleRefresh = () => {
    setActiveCategories([]);
    setTimeout(() => setActiveCategories(categories), 150);
  };

  return (
    <div className="bg-gray-900 text-white p-4 rounded-2xl shadow-lg flex space-x-6">
      {/* Chart */}
      <div className="w-3/4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
            NASA Budget Heatmap (in Billions $)
          </h2>
          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium shadow-md"
          >
            Refresh
          </button>
        </div>

        <ResponsiveContainer width="100%" height={500}>
          <ComposedChart data={data} layout="vertical">
            <CartesianGrid stroke="#444" strokeDasharray="3 3" />
            <XAxis
              type="number"
              stroke="#aaa"
              tickFormatter={(val) => `$${val}B`}
            />
            <YAxis
              type="category"
              dataKey="Year"
              stroke="#aaa"
              width={120}
              interval={0}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#222" }}
              formatter={(value) => `$${value}B`}
            />
            <Legend wrapperStyle={{ color: "#fff" }} />
            {categories.map(
              (cat, i) =>
                activeCategories.includes(cat) && (
                  <Bar
                    key={cat}
                    dataKey={cat}
                    stackId="a"
                    fill={COLORS[i % COLORS.length]}
                  ></Bar>
                )
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* AI Panel */}
      <div className="w-1/4 bg-[#151530] rounded-xl p-4 shadow-lg flex flex-col border border-purple-700/30">
        <div className="flex mb-3 space-x-2 overflow-x-auto">
          {["SUMMARY", "OUTLIER", "INSIGHT", "ASK AI"].map((tab) => (
            <button
              key={tab}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all whitespace-nowrap ${
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

        <div className="flex-1 overflow-y-auto text-gray-200 p-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "ASK AI" ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    rows={4}
                    value={askQuestion}
                    onChange={(e) => setAskQuestion(e.target.value)}
                    className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-600 resize-none"
                    placeholder="Type your question here..."
                  />
                  <button
                    onClick={handleAskAI}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-md text-sm font-medium"
                  >
                    Ask AI
                  </button>
                  {askAnswer && (
                    <div className="mt-2 p-2 bg-gray-800 rounded-md text-sm whitespace-pre-line">
                      {askAnswer}
                    </div>
                  )}
                </div>
              ) : (
                <pre className="text-sm leading-relaxed whitespace-pre-wrap">
                  {tabContent[activeTab]}
                </pre>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
