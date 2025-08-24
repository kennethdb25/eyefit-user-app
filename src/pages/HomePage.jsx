import { Home, Bell, User, ShoppingCart } from "lucide-react"; // icons
import { FaRegSmile } from "react-icons/fa"; // FaceID placeholder

export default function HomePage() {
  const products = [
    { id: 1, name: "Rayban", price: "$120" },
    { id: 2, name: "Gucci", price: "$150" },
    { id: 1, name: "Rayban", price: "$120" },
    { id: 2, name: "Gucci", price: "$150" },
    { id: 1, name: "Rayban", price: "$120" },
    { id: 2, name: "Gucci", price: "$150" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <h2 className="text-xl font-bold mb-2 px-4 mt-4">Popular Products</h2>

      {/* Content Section */}
      <div className="flex-1 px-4 pb-20">
        {" "}
        {/* added pb-20 so content won't be hidden by nav */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <div key={p.id} className="border p-4 rounded-xl shadow-sm">
              <img
                src="/glasses.png"
                alt={p.name}
                className="w-full h-24 object-contain"
              />
              <h3 className="mt-2 font-semibold">{p.name}</h3>
              <p className="text-gray-500">{p.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-green-200 z-50">
        <div className="flex justify-around items-center h-16">
          {/* Home */}
          <button className="flex flex-col items-center text-black">
            <Home className="w-6 h-6" />
          </button>

          {/* Notifications */}
          <button className="flex flex-col items-center text-black">
            <Bell className="w-6 h-6" />
          </button>

          {/* Middle Circle (Face ID / Scan) */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
              <FaRegSmile className="w-7 h-7 text-black" />
            </div>
          </div>

          {/* Profile */}
          <button className="flex flex-col items-center text-black">
            <User className="w-6 h-6" />
          </button>

          {/* Cart */}
          <button className="flex flex-col items-center text-black">
            <ShoppingCart className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
