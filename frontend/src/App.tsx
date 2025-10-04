import { BrowserRouter, Routes, Route } from "react-router-dom";
import Analytics from "./pages/Analytics";
import KnowledgeGraph from "./pages/KnowledgeGraph";
import MissionPlanner from "./pages/MissionPlanner";
import TopNav from "./components/TopNav";

export default function App() {
  return (
    <BrowserRouter>
      <TopNav />
      <Routes>
        <Route path="/" element={<Analytics />} />
        <Route path="/knowledge-graph" element={<KnowledgeGraph />} />
        <Route path="/mission-planner" element={<MissionPlanner />} />
      </Routes>
    </BrowserRouter>
  );
}
