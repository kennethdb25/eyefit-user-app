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
// import FaceScan from "./pages/FaceScan";
import Account from "./pages/Account";
// import Settings from "./pages/Settings";
import Cart from "./pages/Cart";
// import PlaceOrder from "./pages/PlaceOrder";
import BookAppointment from "./pages/BookAppointment"

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
      const data = await fetch("/api/users/validate", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: validToken,
        },
      });
      const res = await data.json();

      if (res.status === 401 || !res || !location.pathname === "/") {
        console.log(res);
      } else {
        console.log(res);
        console.log("Verified User");
        setLoginData(res);
        history("/home");
      }
    }
  };


  const fetchData = async () => {
    try {
      const res = await fetch(
        `/api/user/get-checkout?userId=${loginData?.body?._id}`
      );
      const json = await res.json();
      setCartItems(json.body || []); // assuming your API responds with { body: [...] }
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  useEffect(() => {
    // appointmentDataFetch();
    LoginValidation();
    setTimeout(() => {
      fetchData();
    }, 3000);
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
            <Route path="/home" element={<HomePage cartData={fetchData} />} />
            <Route path="/cart" element={<Cart cartItems={cartItems} setCartItems={setCartItems} cartData={fetchData} />} />
            <Route path="/notifications" element={<Notifications />} />
            {/* <Route path="/facescan" element={<FaceScan />} /> */}
            <Route path="/account" element={<Account />} />
            {/* <Route path="/settings" element={<Settings />} /> */}
            {/* <Route path="/place-order" element={<PlaceOrder />} /> */}
            <Route path="/appointment" element={<BookAppointment />} />
          </Routes>
          {loginData ? (<Navigation cartItems={cartItems} fetchData={fetchData} />) : null}
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
