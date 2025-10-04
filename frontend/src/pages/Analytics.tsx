import NasaBudgetVisualization from "@/components/NASABudget";
import PapersTable from "@/components/PapersTable";
import ResearchEvolutionChart from "@/components/ResearchEvolutionOverTime";

const Analytics = () => {
  return (
    <div className="p-6 bg-gray-800 min-h-screen text-white">
      <div className="flex flex-col gap-8">
        {" "}
        <ResearchEvolutionChart />
        <NasaBudgetVisualization />
        <PapersTable />
      </div>
    </div>
  );
};

export default Analytics;
