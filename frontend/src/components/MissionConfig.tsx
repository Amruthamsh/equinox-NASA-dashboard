import React, { useState } from "react";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Rocket, Atom, AlertTriangle } from "lucide-react";
// --- SCIENCE-GRADED DEFAULTS ---
// For brevity I've included representative numeric defaults; tune these with project leads.
// Units: deltaV (km/s), duration (days), fuel (kg), payload (kg), crew (count),
// commsLatency (secs one-way), gravity (m/s^2), radDose (mSv/yr), power (kW)

const defaultMissionValues = {
  Mars: {
    Analysis: {
      "Scientific Research": {
        deltaV: 11.8, // transfer + capture estimate (km/s) — DRA-order magnitude
        duration: 200, // cruise only (days) — typical interplanetary cruise. See NASA timeline.
        fuel: 30000,
        payload: 800,
        crew: 0,
        coordinates: "Target region selectable (e.g., Gale Crater)",
        commsLatency: 600, // ~5-20 min. 600s = 10min one-way typical depending on geometry
        gravity: 3.71,
        radDose: 100, // mSv/yr (rough order for deep-space exposure planning)
        power_kW: 5,
        isru_required: false,
        edlDifficulty: 7, // 1-10 (10 = hardest)
        context: "Initial analysis: trajectory & science trade studies.",
      },
      Colonization: {
        deltaV: 12.2,
        duration: 200,
        fuel: 50000,
        payload: 1500,
        crew: 0,
        coordinates: "Candidate polar/low-latitude staging sites",
        commsLatency: 600,
        gravity: 3.71,
        radDose: 120,
        power_kW: 20,
        isru_required: true,
        edlDifficulty: 8,
        context: "Architectural trade studies for ISRU and habitat pre-deploy.",
      },
    },
    Planning: {
      "Scientific Research": {
        deltaV: 12.0,
        duration: 540, // mission-duration including surface ops (days)
        fuel: 50000,
        payload: 1000,
        crew: 4,
        coordinates: "4.5N, 137.4E (Gale-like example)",
        commsLatency: 600,
        gravity: 3.71,
        radDose: 150,
        power_kW: 10,
        isru_required: false,
        edlDifficulty: 8,
        context: "Full mission planning for rover/orbiter/short human sortie.",
      },
      Colonization: {
        deltaV: 12.5,
        duration: 730,
        fuel: 80000,
        payload: 5000,
        crew: 10,
        coordinates: "0.0N, 0.0E (near-equatorial staging)",
        commsLatency: 600,
        gravity: 3.71,
        radDose: 200,
        power_kW: 100,
        isru_required: true,
        edlDifficulty: 9,
        context: "Predeploy habitats, ISRU plants; long-duration surface ops.",
      },
    },
    Execution: {
      "Scientific Research": {
        deltaV: 12.0,
        duration: 540,
        fuel: 52000,
        payload: 1050,
        crew: 4,
        coordinates: "Operational target (mission dependent)",
        commsLatency: 600,
        gravity: 3.71,
        radDose: 160,
        power_kW: 12,
        isru_required: false,
        edlDifficulty: 8,
        context: "In-flight operations and surface campaign execution.",
      },
      Colonization: {
        deltaV: 12.5,
        duration: 1095, // long-term operations
        fuel: 90000,
        payload: 7000,
        crew: 12,
        coordinates: "Primary base site",
        commsLatency: 600,
        gravity: 3.71,
        radDose: 220,
        power_kW: 200,
        isru_required: true,
        edlDifficulty: 9,
        context: "Colony deployment and long-term logistics.",
      },
    },
  },

  Moon: {
    Analysis: {
      "Scientific Research": {
        deltaV: 6.0, // LEO->LLO + lunar landing portion approximations
        duration: 5,
        fuel: 8000,
        payload: 300,
        crew: 0,
        coordinates: "Candidate (e.g., 0.674N, 23.473E Apollo site)",
        commsLatency: 1.3, // ~1.3s one-way Earth-Moon
        gravity: 1.62,
        radDose: 50,
        power_kW: 2,
        isru_required: false,
        edlDifficulty: 5,
        context: "Science mission analysis (payload design and trajectory).",
      },
      Colonization: {
        deltaV: 6.5,
        duration: 180,
        fuel: 20000,
        payload: 1500,
        crew: 4,
        coordinates: "Polar candidate sites",
        commsLatency: 1.3,
        gravity: 1.62,
        radDose: 60,
        power_kW: 20,
        isru_required: true,
        edlDifficulty: 6,
        context: "Lunar base pre-deploy trade studies.",
      },
    },
    Planning: {
      "Scientific Research": {
        deltaV: 6.0,
        duration: 14,
        fuel: 15000,
        payload: 500,
        crew: 2,
        coordinates: "0.674N, 23.473E",
        commsLatency: 1.3,
        gravity: 1.62,
        radDose: 55,
        power_kW: 3,
        isru_required: false,
        edlDifficulty: 5,
        context: "Short-duration surface sorties, geology focus.",
      },
      Colonization: {
        deltaV: 6.5,
        duration: 180,
        fuel: 30000,
        payload: 2000,
        crew: 4,
        coordinates: "Polar rim",
        commsLatency: 1.3,
        gravity: 1.62,
        radDose: 65,
        power_kW: 50,
        isru_required: true,
        edlDifficulty: 6,
        context: "Initial lunar base and life-support verification.",
      },
    },
    Execution: {
      "Scientific Research": {
        deltaV: 6.0,
        duration: 21,
        fuel: 16000,
        payload: 600,
        crew: 3,
        coordinates: "Science site",
        commsLatency: 1.3,
        gravity: 1.62,
        radDose: 60,
        power_kW: 5,
        isru_required: false,
        edlDifficulty: 5,
        context: "Science operations in progress.",
      },
      Colonization: {
        deltaV: 6.5,
        duration: 365,
        fuel: 35000,
        payload: 4000,
        crew: 6,
        coordinates: "Base site",
        commsLatency: 1.3,
        gravity: 1.62,
        radDose: 70,
        power_kW: 80,
        isru_required: true,
        edlDifficulty: 6,
        context: "Base operations and logistics.",
      },
    },
  },

  Asteroid: {
    Analysis: {
      "Scientific Research": {
        deltaV: 3.0, // depends greatly on target NEO; NHATS shows mission deltaV per-target
        duration: 90,
        fuel: 2000,
        payload: 200,
        crew: 0,
        coordinates: "NEA rendezvous (varies)",
        commsLatency: 300, // depends on Earth-NEA distance
        gravity: 0.0001,
        radDose: 80,
        power_kW: 1,
        isru_required: false,
        edlDifficulty: 2,
        context: "Rendezvous and sample-return trade studies.",
      },
      Colonization: {
        deltaV: 4.0,
        duration: 180,
        fuel: 5000,
        payload: 1000,
        crew: 2,
        coordinates: "Accessible NEA (NHATS candidate)",
        commsLatency: 300,
        gravity: 0.0001,
        radDose: 90,
        power_kW: 5,
        isru_required: true,
        edlDifficulty: 3,
        context: "ISRU demonstrations on NEOs; resource prospecting.",
      },
    },
    Planning: {
      "Scientific Research": {
        deltaV: 3.5,
        duration: 120,
        fuel: 3000,
        payload: 300,
        crew: 0,
        coordinates: "NEA target",
        commsLatency: 300,
        gravity: 0.0001,
        radDose: 90,
        power_kW: 1,
        isru_required: false,
        edlDifficulty: 2,
        context: "Sample return mission planning.",
      },
      Colonization: {
        deltaV: 4.5,
        duration: 240,
        fuel: 8000,
        payload: 2500,
        crew: 4,
        coordinates: "NEA base candidate",
        commsLatency: 300,
        gravity: 0.0001,
        radDose: 100,
        power_kW: 10,
        isru_required: true,
        edlDifficulty: 3,
        context: "Long-duration NEA operations planning.",
      },
    },
    Execution: {
      "Scientific Research": {
        deltaV: 3.5,
        duration: 150,
        fuel: 3500,
        payload: 350,
        crew: 0,
        coordinates: "Rendezvous target",
        commsLatency: 300,
        gravity: 0.0001,
        radDose: 95,
        power_kW: 2,
        isru_required: false,
        edlDifficulty: 2,
        context: "In-flight sample operations.",
      },
      Colonization: {
        deltaV: 5.0,
        duration: 365,
        fuel: 12000,
        payload: 4000,
        crew: 6,
        coordinates: "NEA base site",
        commsLatency: 300,
        gravity: 0.0001,
        radDose: 110,
        power_kW: 25,
        isru_required: true,
        edlDifficulty: 4,
        context: "Resource extraction & habitat demonstration.",
      },
    },
  },
};

// --- ROBUST AUTOFILL ---
// Accepts mission object {type, phase, objective, ...}
// Normalizes strings and finds best matching key in defaultMissionValues.

function autofillMission(mission, setMission) {
  const normalize = (s) => (s || "").toString().trim().toLowerCase();

  // find type key
  const typeKey = Object.keys(defaultMissionValues).find(
    (k) => normalize(k) === normalize(mission.type)
  );
  if (!typeKey) {
    alert("No defaults for mission type: " + mission.type);
    console.warn("type miss:", mission.type, Object.keys(defaultMissionValues));
    return;
  }

  // find phase key (Analysis/Planning/Execution)
  const phaseKey = Object.keys(defaultMissionValues[typeKey]).find(
    (k) => normalize(k) === normalize(mission.phase)
  );
  if (!phaseKey) {
    alert("No defaults for mission phase: " + mission.phase);
    console.warn(
      "phase miss:",
      mission.phase,
      Object.keys(defaultMissionValues[typeKey])
    );
    return;
  }

  // find objective key
  const objectiveKey = Object.keys(
    defaultMissionValues[typeKey][phaseKey]
  ).find((k) => normalize(k) === normalize(mission.objective));

  if (!objectiveKey) {
    // fallback: if objective not found, pick the first objective available for phase
    const fallbackObjective = Object.keys(
      defaultMissionValues[typeKey][phaseKey]
    )[0];
    console.warn("objective miss; falling back to", fallbackObjective);
    setMission({
      ...mission,
      ...defaultMissionValues[typeKey][phaseKey][fallbackObjective],
    });
    return;
  }

  // apply defaults (shallow merge; overwrites matching keys)
  setMission({
    ...mission,
    ...defaultMissionValues[typeKey][phaseKey][objectiveKey],
  });
}

export const MissionConfig = ({ mission, setMission }) => {
  const [risks, setRisks] = useState({
    radiation: false,
    micrometeoroid: false,
    equipmentFailure: false,
  });

  return (
    <motion.div
      className="p-5 space-y-5 bg-gradient-to-br from-[#05060b] via-[#0b0f1a] to-[#111827] text-white rounded-2xl shadow-2xl border border-cyan-900/40 backdrop-blur-md"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-cyan-800/40 pb-3">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
          <Rocket className="text-cyan-400" /> Mission Configuration
        </h2>
        <Button
          className="bg-green-700 hover:bg-green-600 text-white text-sm px-3 py-1 shadow-md"
          onClick={() => autofillMission(mission, setMission)}
        >
          Autofill Defaults
        </Button>
      </div>

      {/* MISSION BASICS */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-cyan-200 mb-1 block">
            Mission Type
          </label>
          <Select
            value={mission.type}
            onValueChange={(val) => setMission({ ...mission, type: val })}
          >
            <SelectTrigger className="bg-gray-900/60 border border-cyan-800/40 text-white text-sm">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Mars">Mars</SelectItem>
              <SelectItem value="Moon">Moon</SelectItem>
              <SelectItem value="Asteroid">Asteroid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm text-cyan-200 mb-1 block">
            Mission Phase
          </label>
          <Select
            value={mission.phase}
            onValueChange={(val) => setMission({ ...mission, phase: val })}
          >
            <SelectTrigger className="bg-gray-900/60 border border-cyan-800/40 text-white text-sm">
              <SelectValue placeholder="Select Phase" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Planning">Planning</SelectItem>
              <SelectItem value="Execution">Execution</SelectItem>
              <SelectItem value="Analysis">Analysis</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <label className="text-sm text-cyan-200 mb-1 block">
            Scientific Objective
          </label>
          <Select
            value={mission.objective}
            onValueChange={(val) => setMission({ ...mission, objective: val })}
          >
            <SelectTrigger className="bg-gray-900/60 border border-cyan-800/40 text-white text-sm">
              <SelectValue placeholder="Select Objective" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Scientific Research">
                Scientific Research
              </SelectItem>
              <SelectItem value="Colonization">Colonization</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* PARAMETERS */}
      <Card className="bg-gray-900/50 border border-cyan-800/40 shadow-inner">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-cyan-300 text-lg font-semibold">
            <Atom className="text-cyan-400" /> Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-white">
          <Input
            placeholder="ΔV (km/s)"
            type="number"
            className="bg-gray-800/70 border border-cyan-800/40 text-sm"
            value={mission.deltaV || ""}
            onChange={(e) => setMission({ ...mission, deltaV: e.target.value })}
          />
          <Input
            placeholder="Duration (days)"
            type="number"
            className="bg-gray-800/70 border border-cyan-800/40 text-sm"
            value={mission.duration || ""}
            onChange={(e) =>
              setMission({ ...mission, duration: e.target.value })
            }
          />
          <Input
            placeholder="Fuel (kg)"
            type="number"
            className="bg-gray-800/70 border border-cyan-800/40 text-sm"
            value={mission.fuel || ""}
            onChange={(e) => setMission({ ...mission, fuel: e.target.value })}
          />
          <Input
            placeholder="Payload (kg)"
            type="number"
            className="bg-gray-800/70 border border-cyan-800/40 text-sm"
            value={mission.payload || ""}
            onChange={(e) =>
              setMission({ ...mission, payload: e.target.value })
            }
          />
          <Input
            placeholder="Crew"
            type="number"
            className="bg-gray-800/70 border border-cyan-800/40 text-sm"
            value={mission.crew || ""}
            onChange={(e) => setMission({ ...mission, crew: e.target.value })}
          />
          <Input
            placeholder="Coordinates"
            className="col-span-2 bg-gray-800/70 border border-cyan-800/40 text-sm"
            value={mission.coordinates || ""}
            onChange={(e) =>
              setMission({ ...mission, coordinates: e.target.value })
            }
          />
        </CardContent>
      </Card>

      {/* RISK FACTORS */}
      <Card className="bg-gray-900/50 border border-red-900/30 shadow-inner">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-red-400 text-lg font-semibold">
            <AlertTriangle className="text-red-400" /> Risks
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          {Object.entries(risks).map(([key, value]) => (
            <label
              key={key}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-red-300"
            >
              <input
                type="checkbox"
                checked={value}
                onChange={(e) =>
                  setRisks({ ...risks, [key]: e.target.checked })
                }
              />
              <span className="capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </span>
            </label>
          ))}
        </CardContent>
      </Card>

      {/* CONTEXT */}
      <Card className="bg-gray-900/50 border border-cyan-800/40 shadow-inner">
        <CardHeader className="pb-2">
          <CardTitle className="text-cyan-300 text-lg font-semibold">
            Mission Context
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add mission context or AI-generated insights..."
            rows={3}
            className="bg-gray-800/70 border border-cyan-800/40 text-sm text-white"
            value={mission.context || ""}
            onChange={(e) =>
              setMission({ ...mission, context: e.target.value })
            }
          />
        </CardContent>
      </Card>

      {/* GENERATE */}
      <div className="flex justify-end">
        <Button className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg transition-all duration-300">
          Generate AI Suggestions
        </Button>
      </div>
    </motion.div>
  );
};
