# Equinox — From Space Research to Mission Readiness

## Project Summary

**High-Level Summary**

**Equinox** is an **AI-driven research exploration and mission planning platform** designed to help citizens, scientists, policymakers, and mission planners make sense of NASA’s vast research ecosystem. It connects research publications, funding data, and mission goals into a single interactive environment — enabling **data-driven insights, discovery, and strategic decision-making**.

It connects research publications, funding data, and mission objectives into a single interactive environment — enabling data-driven insights, discovery, and strategic decision-making.

the system “solves” the challenge of **navigating and interpreting NASA’s complex research landscape** by making it **interactive, explainable, and actionable**. It empowers users to learn and explore NASA's vast data, uncover hidden connections, identify funding gaps, and make informed strategic decisions — ultimately accelerating curiosity, innovation and improving mission planning. 

The ultimate aim is to accelerate discovery and mission readiness by turning NASA’s fragmented research data into a living knowledge system.
We hope Equinox inspires users to ask new questions, uncover overlooked opportunities, and shape the future of space exploration through informed insights.

<img width="3024" height="1806" alt="image" src="https://github.com/user-attachments/assets/40c76a79-3de8-4bf9-a62c-3763547d0f9d" />

## Project Details

The platform consists of three key modules:

1. Analytics (Explore Papers) – Allows users to browse or upload research datasets, filter by topics or years, and visualize trends such as research evolution, funding concentration, and impact metrics. AI analyzes the visualization and presents Summary, Outlier, Insight. The User can ask drill-down queries on the data. Using LLMs, the system detects anomalies (e.g., underfunded areas) and enables “what-if” simulations to predict how reallocating budgets could influence research outcomes.

2. Knowledge Graph (KG) – Clusters hundreds of research papers using LLM, BERTopic, Sentence Transformers to generate an interactive Knowledge & Property Graph. Users can explore clusters, compare studies, apply creative filters,  and ask natural-language questions to reveal relationships and AI-generated insights.

3. Plan Mission – Uses insights from research and funding data to guide mission design. Users can define mission parameters (e.g., Mars, Moon, Asteroid), Mission Phase, Objective. The system intelligently creates relevant methodologies, supporting studies, and recommendations to inform planning and innovation.

### How It Works

**Backend (AI & Data Layer):**
- Python (FastAPI) serves as the backend for managing requests, data aggregation, and model inference.
- Groq API with LLaMA and Qwen 3–32B models powers natural-language understanding, summarization, and reasoning. 
- Sentence Transformers embed abstracts, conclusions, and metadata for semantic search and clustering.
- MongoDB stores publication data, embeddings for fast retrieval of publication data.

**Frontend (Visualization & Interaction):**

- Built using React + Vite with TailwindCSS and shadcn/ui for a sleek, modern interface.
- Recharts for generating dynamic data visualizations (heatmaps, line charts, bar charts).
- React-Force-Graph for interactive graph-based exploration of clustered research data.

The frontend communicates with the FastAPI backend to fetch real-time summaries, insights, and generated figures.

### Benefits

**For Scientists:** Quickly identify high-impact studies, underexplored areas, and research correlations.
**For Policymakers:** Visualize funding efficiency and simulate data-driven allocation strategies.
**For Mission Planners:** Discover relevant research and methodologies aligned with mission objectives.
**For Citizens and Students:** Explore NASA’s research landscape interactively and intuitively.

The system transforms static data into an interactive, explainable, and curiosity-driven learning experience — bridging the gap between research and real-world mission design.

## Use of AI

ChatGPT (Free), GitHub Copilot, and Claude (Free) were used to assist with coding, debugging, and error resolution, with no paid AI models employed. We used AI for budget Analysis which was then manually verified. 

## Space Agency Data

## Space Agency Data

We used this [resource](https://github.com/jgalazka/SB_publications/tree/main) to get links to open access, full text copies of 608 Space Biology publications published since 2010.

For this project, we also leveraged NASA publication data from the PubMed Central (PMC) repository, focusing on research papers related to space science, biology, and mission-critical technologies. The dataset included paper titles, PMC links, abstracts, conclusions, other sections and metadata such as publication and acceptance dates.

Using this data, we:

Extracted abstracts and conclusions to summarize key findings.
Mapped publication dates to track the evolution of research topics over time.
Linked studies to funding and mission relevance, enabling identification of research gaps and trends.
Created interactive knowledge property graphs for exploring relationships between studies, experiments, and mission objectives.

This open NASA dataset inspired the project by providing reliable, mission-relevant research content, which served as the foundation for AI-driven exploration, visualization, and mission planning insights.

## Sources for budget analysis

1. [NASA Annual Budget Documents (FY 2024)](https://www.nasa.gov/wp-content/uploads/2023/03/nasa-fy-2024-cj-v3.pdf)
2. [Planetary Society NASA Budget Data](https://www.planetary.org/space-policy/nasa-budget)
3. [Our World in Data: NASA Annual Budget](https://ourworldindata.org/grapher/nasa-annual-budget)
4. [NASA Budget Plans & Reports](https://www.nasa.gov/budgets-plans-and-reports/)
5. [NASA Value of NASA Report](https://www.nasa.gov/value-of-nasa/)
6. [NASA Historical Budget PDFs](https://www.nasa.gov/wp-content/uploads/2023/12/o45128943-1983-1.pdf)
7. [Statista: NASA Budget by Program Category 2000–2009](https://www.statista.com/statistics/1024446/distribution-nasa-budget-2000-2009/)
8. [NASA Budget History PDF](https://www.lpi.usra.edu/exploration/multimedia/NASABudgetHistory.pdf)
9. [NASA FY 2000 Performance Report](https://www.nasa.gov/wp-content/uploads/2023/10/fy-2000-performance-report.pdf)
10. [Wikipedia: Budget of NASA](https://en.wikipedia.org/wiki/Budget_of_NASA)


## References

### **Data Sources**

1. **NASA PubSpace** – Public access repository for NASA-funded scholarly publications.

   * [https://sti.nasa.gov/submit-to-pubspace](https://sti.nasa.gov/submit-to-pubspace)
2. **PubMed Central (PMC)** – Open-access digital archive of biomedical and life sciences research articles.

   * [https://www.ncbi.nlm.nih.gov/pmc/](https://www.ncbi.nlm.nih.gov/pmc/)
3. **NASA Task Book** – Metadata on NASA-funded research projects, grants, and experiments.

   * [https://taskbook.nasaprs.com](https://taskbook.nasaprs.com)

### **Tools and Software**

1. **Python** – Programming language for backend development, data processing, and AI integration.
2. **FastAPI** – Web framework used for serving the backend APIs.
3. **MongoDB** – NoSQL database for storing publication data, embeddings, and query metadata.
4. **React + Vite** – Frontend framework for building the interactive UI.
5. **TailwindCSS & shadcn/ui** – Styling and UI component libraries.
6. **Recharts** – Library for generating interactive charts and visualizations.
7. **React-Force-Graph** – Library for interactive knowledge graph visualization.
8. **BERTopic** – Topic modeling framework used for clustering research publications.
9. **Sentence Transformers** – Embedding model for semantic search and clustering.
10. **Groq API / LLaMA / Qwen 3–32B** – Large language models for summarization, question answering, and insight generation.

### Documentation & Video Tutorials

1. **Python Official Tutorial** – https://docs.python.org/3/tutorial/
2. **FastAPI Crash Course** – YouTube search “FastAPI Tutorial for Beginners”
3. **React Official Docs & Tutorial** – https://react.dev/learn
4. **MongoDB University Courses** – https://university.mongodb.com/
5. **TailwindCSS Tutorial Videos** – YouTube search “TailwindCSS Tutorial”
6. **BERTopic Example Tutorials** – https://maartengr.github.io/BERTopic/index.html
7. **Sentence Transformers Examples** – https://www.sbert.net/examples.html

### **AI Assistance in Development**

1. **ChatGPT (Free)** – Assisted with coding, debugging, and error resolution.
2. **GitHub Copilot** – Provided coding suggestions and boilerplate code.
3. **Claude (Free)** – Assisted with code debugging and optimization.

### **Libraries and Packages**

1. **pandas, numpy, requests, tqdm, re, os, dotenv** – Used for data handling, API requests, and environment management.
2. **Python regex** – For parsing XML content from PMC.

### **Other Resources**

1. **Open-access images and figures** from PMC and NASA publications used for visualization inspiration.
2. **Sample CSV datasets** for research publications to simulate larger-scale data processing.

