import { NavLink } from "react-router-dom";

const navItems = [
  { name: "Analytics", path: "/" },
  { name: "Knowledge Graph", path: "/knowledge-graph" },
  { name: "Plan Mission", path: "/mission-planner" },
];

export default function TopNav() {
  return (
    <div className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left: Logo & Subtitle */}
        <div className="flex flex-col">
          <span className="text-2xl font-extrabold tracking-widest text-gradient bg-clip-text from-purple-400 via-pink-500 to-blue-400">
            EQUINOX
          </span>
          <span className="text-gray-300 mt-1">
            From Space Research to Mission Readiness
          </span>
        </div>

        {/* Right: Page Navigation */}
        <div className="flex space-x-6">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `relative text-lg px-3 py-2 font-medium transition-colors duration-200 hover:text-purple-400 ${
                  isActive ? "text-purple-400" : "text-gray-300"
                }`
              }
            >
              {item.name}
              {/** Active underline animation */}
              <span
                className={`absolute bottom-0 left-0 w-full h-0.5 bg-purple-400 transition-all ${
                  window.location.pathname === item.path
                    ? "scale-x-100"
                    : "scale-x-0"
                } origin-left`}
              />
            </NavLink>
          ))}
        </div>
      </div>
      {/** Optional: subtle space gradient background */}
      <div className="h-1 bg-gradient-to-r from-purple-700 via-pink-600 to-blue-500" />
    </div>
  );
}
