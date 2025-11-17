import React from "react";
import { Home, Bell, User, Calendar } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom"; // 👈 import useLocation
import { LuScanFace } from "react-icons/lu";

const Navigation = ({ fetchData }) => {
  const history = useNavigate();
  const location = useLocation(); // 👈 get current route

  // Utility to check if route is active
  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-green-200 z-50">
      <div className="flex justify-around items-center h-16">
        {/* Home */}
        <button
          onClick={() => history("/home")}
          className={`flex flex-col items-center ${
            isActive("/home") ? "text-green-600 font-bold" : "text-black"
          }`}
        >
          <Home className="w-6 h-6" />
        </button>

        {/* Notifications */}
        <button
          onClick={() => history("/notifications")}
          className={`flex flex-col items-center ${
            isActive("/notifications")
              ? "text-green-600 font-bold"
              : "text-black"
          }`}
        >
          <Bell className="w-6 h-6" />
        </button>

        {/* Middle Circle (Face ID / Scan) */}
        <div
          onClick={() => history("/face-shape-detector")}
          className="absolute -top-6 left-1/2 transform -translate-x-1/2"
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg cursor-pointer ${
              isActive("/face-shape-detector") ? "bg-green-500" : "bg-white"
            }`}
          >
            <LuScanFace
              className={`w-7 h-7 ${
                isActive("/face-shape-detector") ? "text-white" : "text-black"
              }`}
            />
          </div>
        </div>

        {/* Profile */}
        <button
          onClick={() => history("/account")}
          className={`flex flex-col items-center ${
            isActive("/account") ? "text-green-600 font-bold" : "text-black"
          }`}
        >
          <User className="w-6 h-6" />
        </button>

        {/* Cart */}
        <button
          onClick={() => history("/appointment")}
          className={`flex flex-col items-center relative ${
            isActive("/appointment") ? "text-green-600 font-bold" : "text-black"
          }`}
        >
          <Calendar className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Navigation;
