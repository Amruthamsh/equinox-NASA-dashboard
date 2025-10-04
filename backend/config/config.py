

import os
from groq import Groq
from dotenv import load_dotenv
load_dotenv()

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

TAB_PROMPTS = {
    "SUMMARY": "Provide a concise summary of recent NASA bioscience research trends.",
    "OUTLIER": "Identify unusual or outlier research trends in NASA bioscience publications.",
    "INSIGHT": "Provide insights or interesting patterns from NASA bioscience research data."
}

CATEGORIES = {
    'Microgravity Effects': 'Experiments on gravity, weightlessness, and their effects on biological systems including physiological, cellular, and molecular responses to altered gravity.',
    'Radiation Biology': 'Studies of cosmic radiation, particle exposure, and radiation effects on cells, organisms, and humans in space environments.',
    'Plant & Microbial Biology': 'Plant growth, seeds, germination, agriculture, and microbial biology in space including microbiome studies and microbial adaptation to space conditions.',
    'Human Physiology & Behavior': 'Human health and physiological studies, including cardiovascular, musculoskeletal, cognitive, and behavioral experiments on astronauts and crew.',
    'Molecular & Cell Biology': 'Molecular, cellular, proteomic, genomic, and omics studies, covering gene expression, proteins, DNA, RNA, and cellular mechanisms in space.',
    'Space Medicine': 'Medical interventions, therapies, treatments, and countermeasures for health risks associated with spaceflight and prolonged exposure to microgravity or radiation.',
    'Life Support & Environment': 'Studies on air, water, waste management, and environmental control systems for sustaining life in spacecraft or habitats.',
    'Space Systems & Instrumentation': 'Development and testing of devices, instruments, hardware, and experimental technologies used in space research and bioscience experiments.',
    'Synthetic Biology & Tissue Engineering': 'Tissue growth and synthetic biology in space Engineering tissues, organoids, or synthetic biological systems, including growth and manipulation of biological samples in space.'
}

category_names = list(CATEGORIES.keys())
category_texts = [CATEGORIES[c] for c in category_names]