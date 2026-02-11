/* eslint-disable no-unused-vars */
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import { Spin } from "antd";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HomePage from "./pages/HomePage";
import { useContext, useEffect, useRef, useState } from "react";
import { LoginContext } from "./context/LoginContext";
import Navigation from "./pages/Navigation";
import Notifications from "./pages/Notifications";
import FaceScan from "./pages/FaceScan";
import Account from "./pages/Account";
import Onboarding from "./pages/Onboarding";
import Cart from "./pages/Cart";
// import PlaceOrder from "./pages/PlaceOrder";
import BookAppointment from "./pages/BookAppointment"
import MyOrdersPage from "./pages/MyOrdersPage";
import FaceShapeDetector from "./pages/FaceShapeDetector";

function App() {
  const history = useNavigate();
  const location = useLocation();
  const { loginData, setLoginData } = useContext(LoginContext);
  const [percent, setPercent] = useState(-50);
  const [data, setData] = useState("");
  const [cartItems, setCartItems] = useState([]);

  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setPercent((v) => {
        const nextPercent = v + 5;
        return nextPercent > 150 ? -50 : nextPercent;
      });
    }, 100);
    return () => clearTimeout(timerRef.current);
  }, [percent]);
  const mergedPercent = percent;

  const LoginValidation = async () => {
    if (localStorage.getItem("accountUserToken")) {
      let validToken = localStorage.getItem("accountUserToken");
      const data = await fetch("https://eyefit-shop-047b26dc31ed.herokuapp.com/api/users/validate", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: validToken,
        },
      });
      const res = await data.json();

      if (res.status === 401) {
        console.log(res);
      } else {
        console.log(res);
        console.log("Verified User");
        setLoginData(res);
        const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
        if (!hasSeenOnboarding) {
          history("/onboarding");
        } else {
          history("/home");
        }
      }
    }
  };


  const fetchData = async () => {
    try {
      const res = await fetch(
        `https://eyefit-shop-047b26dc31ed.herokuapp.com/api/user/get-checkout?userId=${loginData?.body?._id}`
      );
      const json = await res.json();
      setCartItems(json.body || []);
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginData?.body?._id]);

  useEffect(() => {
    // appointmentDataFetch();
    LoginValidation();
    setTimeout(() => {
      setData(true);
    }, 3000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {data ? (
        <div className="app" >
          <Routes>
            <Route path="/" element={<Login LoginValidation={LoginValidation} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<HomePage cartData={fetchData} cartItems={cartItems} />} />
            <Route path="/cart" element={<Cart cartItems={cartItems} setCartItems={setCartItems} cartData={fetchData} />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/facescan" element={<FaceScan />} />
            <Route path="/face-shape-detector" element={<FaceShapeDetector />} />
            <Route path="/account" element={<Account setData={setData} />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/my-orders" element={<MyOrdersPage />} />
            <Route path="/appointment" element={<BookAppointment />} />
          </Routes>
          {loginData && localStorage.getItem("hasSeenOnboarding") ? (<Navigation cartItems={cartItems} fetchData={fetchData} />) : null}
        </div>
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            color: "white",
          }}
        >
          <Spin percent={mergedPercent} size="large" />
        </Box>
      )}
    </div>
  );
}

export default App;
