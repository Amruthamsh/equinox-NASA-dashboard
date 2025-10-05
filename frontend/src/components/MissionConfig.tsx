import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { defaultMissionValues } from "../data/DefaultMissionValues";
import { Info } from "lucide-react";

export const MissionConfig = ({ mission, setMission, onSubmit }) => {
  const autofillMission = () => {
    const { type, phase, objective } = mission;
    const defaults = defaultMissionValues?.[type]?.[phase]?.[objective] || null;

    if (!defaults) return alert("No defaults found for this selection.");

    const cleanedContext = defaults.context
      ? defaults.context.replace(/\n\s+/g, "\n").trim()
      : "";

    setMission((prev) => ({
      ...prev,
      ...defaults,
      summary: cleanedContext,
      additionalContext: "",
      type: prev.type,
      phase: prev.phase,
      objective: prev.objective,
    }));
  };

  const Tooltip = ({ text }) => (
    <div className="relative flex items-center">
      <Info size={14} className="text-gray-400 cursor-pointer" />
      <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
        {text}
      </div>
    </div>
  );

  const handleChange = (key, value) => {
    setMission((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = () => {
    console.log("Submitting mission:", mission);
    if (
      mission.type === "" ||
      mission.phase === "" ||
      mission.objective === "" ||
      mission.deltaV === undefined ||
      mission.duration === undefined ||
      mission.fuel === undefined ||
      mission.payload === undefined ||
      mission.crew === undefined ||
      mission.commsLatency === undefined ||
      mission.gravity === undefined ||
      mission.radDose === undefined ||
      mission.power_kW === undefined ||
      mission.edlDifficulty === undefined ||
      mission.coordinates === ""
    ) {
      return alert("Please fill in all required fields.");
    }

    if (onSubmit) onSubmit(mission);
  };

  const tooltips = {
    type: "Select the celestial body for the mission (Mars, Moon, Asteroid).",
    phase: "Select the mission phase: Analysis, Planning, or Execution.",
    objective: "Select mission objective: Scientific Research or Colonization.",
    deltaV: "Required change in velocity for mission maneuvers (km/s).",
    duration: "Mission duration in days (includes cruise and operations).",
    fuel: "Fuel mass allocated for the mission (kg).",
    payload: "Payload mass (kg) including instruments or modules.",
    crew: "Number of crew members on the mission.",
    commsLatency: "One-way communication delay (seconds).",
    gravity: "Surface gravity at target location (m/s²).",
    radDose: "Expected radiation dose (mSv/yr).",
    power_kW: "Power requirement for mission systems (kW).",
    edlDifficulty: "Entry, Descent, Landing difficulty (1=easy, 10=hard).",
    coordinates: "Target coordinates or landing site (lat,long).",
    context: "Optional additional mission context or notes.",
  };

  const inputFields = [
    "deltaV",
    "duration",
    "fuel",
    "payload",
    "crew",
    "commsLatency",
    "gravity",
    "radDose",
    "power_kW",
    "edlDifficulty",
    "coordinates",
  ];

  return (
    <motion.div
      className="p-6 space-y-6 bg-gradient-to-br bg-slate-950 rounded-3xl shadow-2xl border border-gray-700 text-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-700 pb-3">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-500">
          Mission Configuration
        </h2>
        <Button
          className="bg-green-800 hover:bg-green-500 text-white shadow-lg"
          onClick={autofillMission}
        >
          Autofill Defaults
        </Button>
      </div>

      {/* Dropdowns */}
      <div className="grid grid-cols-3">
        {[
          { label: "Type", key: "type", options: ["Mars", "Moon", "Asteroid"] },
          {
            label: "Phase",
            key: "phase",
            options: ["Analysis", "Planning", "Execution"],
          },
          {
            label: "Objective",
            key: "objective",
            options: ["Scientific Research", "Colonization"],
          },
        ].map(({ label, key, options }) => (
          <div key={key} className="flex flex-col">
            <label className="text-sm text-gray-300 mb-1">{label}</label>
            <Select
              value={mission[key]}
              onValueChange={(val) => handleChange(key, val)}
            >
              <SelectTrigger className="bg-gray-800/70 border border-gray-700 text-white">
                <SelectValue placeholder={`Select ${label}`} />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white">
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <hr className="border-t border-gray-600 my-4" />

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-5">
        {inputFields.map((key) => (
          <div className="flex flex-col relative group">
            <label className="text-sm text-gray-300 mb-1 flex items-center gap-1">
              {key} <Tooltip text={tooltips[key]} />
            </label>
            <Input
              type={typeof mission[key] === "number" ? "number" : "text"}
              value={mission[key] || ""}
              onChange={(e) =>
                handleChange(
                  key,
                  typeof mission[key] === "number"
                    ? Number(e.target.value)
                    : e.target.value
                )
              }
              className="bg-gray-800/80 border border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-500 shadow-inner"
            />
          </div>
        ))}
      </div>

      {/* Context */}
      <div>
        <label className="text-sm text-gray-300 mb-1 block">
          Add Additional Mission Context (optional)
        </label>
        <Textarea
          rows={5}
          onChange={(e) => handleChange("additionalContext", e.target.value)}
          className="bg-gray-800/80 border border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-500 shadow-inner resize-none whitespace-pre-wrap"
        />
      </div>

      {/* Submit Button */}
      <div className="text-right">
        <Button
          className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg"
          onClick={handleSubmit}
        >
          Submit Mission
        </Button>
      </div>
    </motion.div>
  );
};
