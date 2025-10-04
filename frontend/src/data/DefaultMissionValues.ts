// --- SCIENCE-GRADED DEFAULTS ---
// For brevity I've included representative numeric defaults; tune these with project leads.
// Units: deltaV (km/s), duration (days), fuel (kg), payload (kg), crew (count),
// commsLatency (secs one-way), gravity (m/s^2), radDose (mSv/yr), power (kW)

export const defaultMissionValues = {
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
        context: `Initial mission architecture and feasibility analysis for Mars science missions. 
        This phase focuses on trajectory optimization, interplanetary cruise timelines, and identifying 
        scientific trade-offs between orbiters, rovers, and stationary landers. Data from prior missions 
        (Curiosity, Perseverance, MAVEN) guide instrument selection, surface environment modeling, and 
        payload accommodation. The goal is to define viable mission profiles and power requirements while 
        minimizing fuel mass and entry/descent complexity.`,
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
        context: `Architectural analysis of semi-permanent Mars base concepts. 
        Focus areas include resource mapping for in-situ propellant production (ISRU), 
        regolith-based construction feasibility, and surface energy system trade studies (solar, nuclear). 
        This analysis supports future human-rated surface architectures by identifying optimal 
        polar landing sites for access to subsurface ice and continuous sunlight. The outcome informs 
        long-term habitation and logistics planning under NASA’s Mars Campaign Strategy.`,
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
        context: `Integrated mission planning for crewed or robotic Mars surface exploration. 
        This includes rover traverse mapping, sample caching strategies, and the establishment 
        of an orbital relay network. The phase involves refining surface science objectives—such as 
        astrobiology and sedimentology—aligned with Mars Sample Return (MSR) goals. Power, life support, 
        and communication constraints are simulated using DRA 5.0 parameters to maximize mission safety and science yield.`,
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
        context: `Predeployment and construction planning for a semi-permanent Mars surface habitat. 
        Engineering focus includes modular pressurized habitats, autonomous assembly systems, and 
        ISRU integration for oxygen, water, and methane production. Psychological and radiation exposure 
        countermeasures are incorporated from analog studies (HI-SEAS, NEK). Logistics simulations ensure 
        redundancy for food and energy cycles supporting up to 10 crew members for 2 Earth years.`,
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
        context: `Active mission phase encompassing cruise, Mars orbit insertion, EDL (Entry-Descent-Landing), 
        and surface operations. Includes EVA scheduling, sample collection, in-situ data transmission, 
        and real-time anomaly management via delayed communication loops. Crew and robotic systems 
        coordinate to achieve primary science milestones under environmental constraints.`,
      },
      Colonization: {
        deltaV: 12.5,
        duration: 1095,
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
        context: `Operational phase of Martian base construction and habitation. 
        Autonomous cargo landers deliver life-support modules, reactors, and ISRU facilities. 
        Crew rotations maintain sustainability through closed-loop recycling, additive manufacturing 
        using local regolith, and field testing of long-term habitat integrity. This phase directly 
        informs sustained human presence and the design of self-sufficient Martian colonies.`,
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
        context: `Feasibility and mission design analysis for robotic lunar exploration. 
        Uses heritage data from Apollo and LRO to define high-value scientific regions such as 
        permanently shadowed craters for volatile detection. Trajectories and descent profiles 
        are modeled using STK or GMAT for precision landing analysis.`,
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
        context: `Early design studies for a lunar outpost leveraging Artemis and CLPS data. 
        Focus on site thermal stability, regolith shielding design, and cryogenic propellant depots. 
        Simulations evaluate ISRU extraction of lunar water ice and power system scalability.`,
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
        context: `Planning for short-duration crewed science missions targeting Apollo heritage sites 
        and geologically diverse regions. Operations include EVA design, communications coverage planning, 
        and payload integration for seismic, mineralogical, and optical instrumentation.`,
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
        context: `Logistical and infrastructure planning for a sustainable lunar habitat, focusing 
        on power continuity, radiation protection, and local resource utilization. Incorporates 
        Artemis Base Camp concepts, mobile rovers, and modular pressurized tunnels.`,
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
        context: `Operational surface campaign executing field geology, instrument deployment, 
        and in-situ data collection. EVA operations and power system health are monitored from 
        Earth-based control centers through high-bandwidth relay orbiters.`,
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
        context: `Long-duration lunar base operations focused on sustaining human life and 
        validating closed-loop systems. Regolith shielding and ISRU plants operate continuously, 
        while surface mobility systems extend science reach to new regions.`,
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
        context: `Mission concept development for Near-Earth Asteroid (NEA) rendezvous missions. 
        Studies focus on transfer trajectories, asteroid rotation synchronization, and sampling 
        mechanism reliability under microgravity. Derived from OSIRIS-REx and Hayabusa heritage data.`,
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
        context: `Exploratory analysis of asteroid mining and resource utilization feasibility. 
        Involves regolith anchoring methods, extraction via thermal and mechanical processing, 
        and the establishment of autonomous robotic systems for material transport.`,
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
        context: `Mission design planning for robotic sampling missions including 
        orbit determination, rendezvous navigation, and sample containment integrity 
        for return trajectories. Coordination with NASA Planetary Defense Office for target selection.`,
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
        context: `Long-duration operations planning for a semi-permanent asteroid research 
        or mining outpost. Includes design for low-gravity construction, radiation protection 
        using regolith bags, and continuous telemetry from deep-space relay assets.`,
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
        context: `Active asteroid rendezvous operations including 
        station-keeping, surface sampling, and onboard data transmission. 
        Continuous autonomous navigation manages target rotation and sunlight exposure.`,
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
        context: `Full-scale asteroid base operations validating sustained human or robotic 
        presence. Focus areas include ISRU-based fuel generation, thermal control, 
        and scalable power management for long-term industrial activity in microgravity.`,
      },
    },
  },
};
