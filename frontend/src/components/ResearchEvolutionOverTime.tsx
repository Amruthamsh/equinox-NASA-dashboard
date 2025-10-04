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
  "#4ADE80",
  "#60A5FA",
  "#FACC15",
  "#F472B6",
  "#FB923C",
  "#A78BFA",
  "#F87171",
  "#34D399",
  "#38BDF8",
];

export default function ResearchEvolutionChart() {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategories, setActiveCategories] = useState([]);

  const [activeTab, setActiveTab] = useState("SUMMARY");
  const [tabContent, setTabContent] = useState({});
  const [askQuestion, setAskQuestion] = useState("");
  const [askAnswer, setAskAnswer] = useState("");

  // Load data for chart
  useEffect(() => {
    axios.get("http://localhost:8000/research-evolution").then((res) => {
      const raw = res.data;
      setData(raw);

      const cats = raw.length
        ? Object.keys(raw[0]).filter((k) => k !== "year")
        : [];
      setCategories(cats);
      setActiveCategories(cats);
    });
  }, []);

  // Load AI tab content (SUMMARY, OUTLIER, INSIGHT) with localStorage caching
  useEffect(() => {
    const storedTabs = localStorage.getItem("aiTabs_ResearchEvolution");
    if (storedTabs) {
      setTabContent(JSON.parse(storedTabs));
    } else {
      axios.get("http://localhost:8000/ai-tabs").then((res) => {
        setTabContent(res.data);
        localStorage.setItem(
          "aiTabs_ResearchEvolution",
          JSON.stringify(res.data)
        );
      });
    }
  }, []);

  const handleAskAI = async () => {
    if (!askQuestion.trim()) return;

    // Use localStorage caching for questions
    const storedAnswers = JSON.parse(
      localStorage.getItem("askAI_ResearchEvolution") || "{}"
    );
    if (storedAnswers[askQuestion]) {
      setAskAnswer(storedAnswers[askQuestion]);
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/ask-ai", {
        question: askQuestion,
        df_summary: tabContent.SUMMARY || "", // provide df summary for context
      });

      const answer = response.data.answer;
      setAskAnswer(answer);

      const updatedAnswers = { ...storedAnswers, [askQuestion]: answer };
      localStorage.setItem(
        "askAI_ResearchEvolution",
        JSON.stringify(updatedAnswers)
      );
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

      {/* AI Insights Panel */}
      <div className="w-1/4 bg-[#151530] rounded-xl p-4 shadow-lg flex flex-col border border-purple-700/30">
        {/* Tabs */}
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
