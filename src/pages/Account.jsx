import React, { useContext, useEffect, useState } from "react";
import {
  SettingOutlined,
  UserOutlined,
  WalletOutlined,
  GiftOutlined,
  CarOutlined,
  StarOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { LoginContext } from "../context/LoginContext";

const Account = () => {
  const { loginData, setLoginData } = useContext(LoginContext);
  const [data, setData] = useState([]);
  const [likeData, setLikeData] = useState([]);
  const [recentlyViewData, setRecentlyViewData] = useState([]);

  const fetchData = async () => {
    try {
      const res = await fetch(
        // https://eyefit-shop-800355ab3f46.herokuapp.com
        `https://eyefit-shop-800355ab3f46.herokuapp.com/api/users/orders?userId=${loginData?.body?._id}`
      );
      const json = await res.json();
      setData(json.body || []); // assuming your API responds with { body: [...] }
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  const fetchLikeData = async () => {
    try {
      // https://eyefit-shop-800355ab3f46.herokuapp.com
      const res = await fetch(
        `https://eyefit-shop-800355ab3f46.herokuapp.com/api/users/like?userId=${loginData?.body?._id}`
      );
      const json = await res.json();
      setLikeData(json.body || []); // assuming your API responds with { body: [...] }
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  const fetchRecentlyViewData = async () => {
    try {
      // https://eyefit-shop-800355ab3f46.herokuapp.com
      const res = await fetch(
        `https://eyefit-shop-800355ab3f46.herokuapp.com/api/users/view?userId=${loginData?.body?._id}`
      );
      const json = await res.json();
      console.log(json.body);
      setRecentlyViewData(json.body || []); // assuming your API responds with { body: [...] }
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  const toPayCount = data.filter(
    (item) =>
      item.status === "Pending" && item.paymentMethod === "Over the counter"
  );
  const toShipCount = data.filter(
    (item) =>
      (item.status === "Pending" &&
        item.paymentMethod === "Cash on Delivery") ||
      item.status === "Processing"
  );
  const shippedCount = data.filter((item) => item.status === "Shipped");
  const completedCount = data.filter((item) => item.status === "Completed");
  const cancelledCount = data.filter((item) => item.status === "Cancelled");

  useEffect(() => {
    fetchData();
    fetchLikeData();
    fetchRecentlyViewData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-green-200 p-6 flex items-center justify-between rounded-b-3xl">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white rounded-full border flex items-center justify-center">
            <UserOutlined className="text-2xl text-gray-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{`${loginData?.body?.name}`}</h2>
            <p className="text-sm text-green-900">{`${loginData?.body?.email}`}</p>
          </div>
        </div>
        <SettingOutlined className="text-lg" />
      </div>

      {/* My Orders Section */}
      <div className="p-4">
        <h3 className="font-semibold mb-2">My Orders</h3>
        <div className="flex justify-between mt-5">
          <div key="To Pay" className="flex flex-col items-center">
            <div className="mb-1 relative">
              <WalletOutlined className="text-lg text-green-600" />
              {toPayCount.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {toPayCount.length}
                </span>
              )}
            </div>
            <p className="text-xs text-center">To Pay</p>
          </div>
          <div key="To Ship" className="flex flex-col items-center">
            <div className="mb-1 relative">
              <GiftOutlined className="text-lg text-green-600" />
              {toShipCount.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {toShipCount.length}
                </span>
              )}
            </div>
            <p className="text-xs text-center">To Ship</p>
          </div>
          <div key="To Receive" className="flex flex-col items-center">
            <div className="mb-1 relative">
              <CarOutlined className="text-lg text-green-600" />
              {shippedCount.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {shippedCount.length}
                </span>
              )}
            </div>
            <p className="text-xs text-center">To Receive</p>
          </div>
          <div key="To Review" className="flex flex-col items-center">
            <div className="mb-1 relative">
              <StarOutlined className="text-lg text-green-600" />
              {completedCount.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {completedCount.length}
                </span>
              )}
            </div>
            <p className="text-xs text-center">To Review</p>
          </div>
          <div key="Cancellation" className="flex flex-col items-center">
            <div className="mb-1 relative">
              <StopOutlined className="text-lg text-green-600" />
              {cancelledCount.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cancelledCount.length}
                </span>
              )}
            </div>
            <p className="text-xs text-center">Cancellation</p>
          </div>
        </div>
      </div>

      {/* Likes Section */}
      <div className="px-4 mb-4">
        <div className="flex justify-between items-center mb-2 mt-5">
          <h3 className="font-semibold">Likes</h3>
          <p className="text-sm text-gray-500">View More &gt;</p>
        </div>
        <div className="flex space-x-3">
          {likeData?.map((i) => (
            <img
              key={i._id}
              src={i?.product?.productImgURL} // Change this path to your actual image source
              alt={`Product ${i.product.productName}`}
              className="w-20 h-24 rounded-lg object-cover"
            />
          ))}
        </div>
      </div>

      {/* Recently Viewed Section */}
      <div className="px-4 mb-4">
        <div className="flex justify-between items-center mb-2 mt-5">
          <h3 className="font-semibold">Recently Viewed</h3>
          <p className="text-sm text-gray-500">View More &gt;</p>
        </div>
        <div className="flex space-x-3">
          {recentlyViewData?.map((i) => (
            <img
              key={i._id}
              src={i?.product?.productImgURL} // Change this path to your actual image source
              alt={`Product ${i.product.productName}`}
              className="w-20 h-24 rounded-lg object-cover"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Account;
