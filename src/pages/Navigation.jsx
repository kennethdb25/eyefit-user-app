import React from "react";
import { Home, Bell, User, ShoppingCart } from "lucide-react"; // icons
import { useNavigate } from "react-router-dom";
import { LuScanFace } from "react-icons/lu";
const Navigation = (props) => {
  const { cartItems, fetchData } = props;
  const history = useNavigate();

  const cartCount = cartItems.length;

  const handleChangeToCartPath = () => {
    fetchData();
    history("/cart");
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-green-200 z-50">
      <div className="flex justify-around items-center h-16">
        {/* Home */}
        <button
          onClick={() => history("/home")}
          className="flex flex-col items-center text-black"
        >
          <Home className="w-6 h-6" />
        </button>

        {/* Notifications */}
        <button
          onClick={() => history("/notifications")}
          className="flex flex-col items-center text-black"
        >
          <Bell className="w-6 h-6" />
        </button>

        {/* Middle Circle (Face ID / Scan) */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
            <LuScanFace className="w-7 h-7 text-black" />
          </div>
        </div>

        {/* Profile */}
        <button
          onClick={() => history("/account")}
          className="flex flex-col items-center text-black"
        >
          <User className="w-6 h-6" />
        </button>

        {/* Cart */}
        <button
          onClick={() => handleChangeToCartPath()}
          className="flex flex-col items-center text-black relative"
        >
          <ShoppingCart className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Navigation;
