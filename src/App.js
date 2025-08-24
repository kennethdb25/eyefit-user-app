import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HomePage from "./pages/HomePage";
// import Notifications from "./pages/Notifications";
// import FaceScan from "./pages/FaceScan";
// import Account from "./pages/Account";
// import Settings from "./pages/Settings";
// import Cart from "./pages/Cart";
// import PlaceOrder from "./pages/PlaceOrder";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<HomePage />} />
      {/* <Route path="/notifications" element={<Notifications />} />
        <Route path="/facescan" element={<FaceScan />} />
        <Route path="/account" element={<Account />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/place-order" element={<PlaceOrder />} /> */}
    </Routes>
  );
}

export default App;
