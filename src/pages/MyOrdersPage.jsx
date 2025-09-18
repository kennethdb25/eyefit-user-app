/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// components/MyOrdersPage.jsx
import React, { useContext, useEffect, useState } from "react";
import { Tabs, Card, Empty, Tag, message, Popconfirm } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import {
  WalletOutlined,
  GiftOutlined,
  CarOutlined,
  StarOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { LoginContext } from "../context/LoginContext";

export default function MyOrdersPage() {
  const location = useLocation();
  const [data, setData] = useState([]);
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get("tab") || "1";
  const { loginData, setLoginData } = useContext(LoginContext);
  const [messageApi, contextHolder] = message.useMessage();
  const history = useNavigate();

  const fetchData = async () => {
    try {
      const res = await fetch(
        `https://eyefit-shop-800355ab3f46.herokuapp.com/api/users/orders?userId=${loginData?.body?._id}`
        // `/api/users/orders?userId=${loginData?.body?._id}`
      );
      const json = await res.json();
      setData(json.body || []); // assuming your API responds with { body: [...] }
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  const handleUpdateStatus = async (status, id) => {
    if (status === "Pending") {
      messageApi.warning("Please select a valid status.");
      return;
    }

    try {
      const response = await fetch(
        `https://eyefit-shop-800355ab3f46.herokuapp.com/api/orders/status/${id}`,
        {
          // const response = await fetch(`/api/orders/status/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }
      await fetchData();
      messageApi.success(`Order ${status} successfully`);
    } catch (error) {
      messageApi.error(error.message);
    }
  };

  // 📊 Filters
  const toPay = data.filter(
    (item) =>
      item.status === "Pending" && item.paymentMethod === "Over the counter"
  );
  const toShip = data.filter(
    (item) =>
      (item.status === "Pending" &&
        item.paymentMethod === "Cash on Delivery") ||
      item.status === "Processing"
  );
  const shipped = data.filter((item) => item.status === "Shipped");
  const completed = data.filter((item) => item.status === "Completed");
  const cancelled = data.filter((item) => item.status === "Cancelled");

  // 🔥 Helper to render orders
  const renderOrderList = (orders) => {
    if (!orders.length) {
      return (
        <Empty
          description={
            <span className="text-gray-600 text-base font-medium">
              No Orders Found
            </span>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          className="py-10"
        />
      );
    }

    return orders.map((order) => (
      <Card
        key={order._id}
        className="mb-6 rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300"
        bodyStyle={{ padding: "20px" }}
      >
        {contextHolder}
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <Tag
            color="blue"
            className="text-sm font-semibold rounded-md px-3 py-1"
          >
            {order.company}
          </Tag>
          <Tag
            color={
              order.status === "Completed"
                ? "green"
                : order.status === "Pending"
                ? "orange"
                : order.status === "Cancelled"
                ? "red"
                : "orange"
            }
            className="text-sm font-semibold rounded-md px-3 py-1"
          >
            {order.status}
          </Tag>
        </div>

        {/* Products */}
        <div className="space-y-4">
          {order.products.map((prod) => (
            <div
              key={prod._id}
              className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300"
            >
              <img
                src={prod.product.productImgURL}
                alt={prod.product.productName}
                className="w-16 h-16 object-cover rounded-md border border-gray-200"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-800">
                  {prod.product.productName}
                </p>
                <p className="text-sm text-gray-500">
                  Color: {prod.color} | Qty: {prod.quantity}
                </p>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                ₱{prod.product.price.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Total */}

        <p className="text-sm text-gray-500 ml-3">
          Payment Method: {order.paymentMethod}
        </p>
        <div
          className={`flex mt-5 ${
            order.status === "Pending" ? "justify-between" : "justify-end"
          }`}
        >
          {order.status === "Pending" && (
            <Popconfirm
              title="Cancel Order"
              description="Are you sure to cancel this order?"
              okText="Yes"
              cancelText="No"
              onConfirm={() => handleUpdateStatus("Cancelled", order._id)}
            >
              <button
                className="flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-2.5 
                 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full 
                 shadow-md transition-all duration-300 hover:shadow-lg active:scale-95 
                 text-xs sm:text-sm md:text-base"
              >
                <StopOutlined className="text-lg" />
                CANCEL ORDER
              </button>
            </Popconfirm>
          )}
          <p className="text-lg font-bold text-gray-900">
            Total: ₱{order.total.toLocaleString()}
          </p>
        </div>
      </Card>
    ));
  };

  // 🔹 Tabs
  const tabItems = [
    {
      key: "1",
      label: (
        <span>
          <WalletOutlined /> To Pay ({toPay.length})
        </span>
      ),
      children: renderOrderList(toPay),
    },
    {
      key: "2",
      label: (
        <span>
          <GiftOutlined /> To Ship ({toShip.length})
        </span>
      ),
      children: renderOrderList(toShip),
    },
    {
      key: "3",
      label: (
        <span>
          <CarOutlined /> To Receive ({shipped.length})
        </span>
      ),
      children: renderOrderList(shipped),
    },
    {
      key: "4",
      label: (
        <span>
          <StarOutlined /> To Review ({completed.length})
        </span>
      ),
      children: renderOrderList(completed),
    },
    {
      key: "5",
      label: (
        <span>
          <StopOutlined /> Cancelled ({cancelled.length})
        </span>
      ),
      children: renderOrderList(cancelled),
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <div className="bg-white p-4 flex items-center shadow">
        <button onClick={() => history("/account")} className="mr-3">
          &lt;
        </button>
        <h1 className="text-xl font-semibold">My Orders</h1>
      </div>
      <Tabs defaultActiveKey={activeTab} items={tabItems} />
    </div>
  );
}
