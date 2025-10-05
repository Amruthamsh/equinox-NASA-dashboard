import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "@fontsource/orbitron";

const navItems = [
  { name: "Analytics", path: "/" },
  { name: "Knowledge Graph", path: "/knowledge-graph" },
  { name: "Plan Mission", path: "/mission-planner" },
];

export default function TopNav() {
  const location = useLocation();
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const activeIndex = navItems.findIndex(
      (item) => item.path === location.pathname
    );
    const activeLink = navRefs.current[activeIndex];
    if (activeLink) {
      setUnderlineStyle({
        left: activeLink.offsetLeft + 12, // Adjust for padding
        width: activeLink.offsetWidth - 20, // Adjust for padding
      });
    }
  }, [location]);

  return (
    <div className="bg-gray-900 text-white shadow-lg relative">
      <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-between relative">
        {/* Left: Logo & Subtitle */}
        <div className="flex flex-col">
          <span
            className="text-3xl font-extrabold tracking-widest bg-clip-text text-blue-400"
            style={{
              fontFamily: "'Orbitron', sans-serif",
            }}
          >
            EQUINOX
          </span>
          <span className="mt-1 text-lg text-gray-200">
            From Space Research to Mission Readiness
          </span>
        </div>

        {/* Right: Page Navigation */}
        <div className="flex space-x-6 relative">
          {navItems.map((item, idx) => (
            <NavLink
              key={item.name}
              to={item.path}
              ref={(el) => {
                navRefs.current[idx] = el;
              }}
              className={({ isActive }) =>
                `relative text-lg px-3 py-2 font-medium transition-colors duration-200 hover:text-purple-400 ${
                  isActive ? "text-purple-400" : "text-gray-300"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}

          {/* Animated underline */}
          <span
            className="absolute bottom-0 h-0.5 bg-purple-400 transition-all duration-300"
            style={{
              left: underlineStyle.left,
              width: underlineStyle.width,
            }}
          />
        </div>
      </div>

      {/* Optional subtle space gradient */}
      <div className="h-0.5 bg-gradient-to-r from-purple-700 via-pink-600 to-blue-500" />
    </div>
  );
}
