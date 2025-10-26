/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// components/MyOrdersPage.jsx
import React, { useContext, useEffect, useState } from "react";
import {
  Tabs,
  Card,
  Empty,
  Tag,
  message,
  Popconfirm,
  Modal,
  Rate,
  Input,
  Button,
  Divider,
  Badge,
} from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import {
  WalletOutlined,
  GiftOutlined,
  CarOutlined,
  StarOutlined,
  StopOutlined,
  CheckCircleOutlined,
  StarFilled,
  MessageOutlined,
} from "@ant-design/icons";
import { LoginContext } from "../context/LoginContext";

function ReviewForm({ itemId, userId, onReviewAdded, onClose, fetchData }) {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  const payload = {
    comment,
    rating,
    userId,
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (!rating || !comment.trim()) {
      messageApi.warning("Please add a rating and comment.");
      return;
    }

    try {
      const res = await fetch(
        `https://eyefit-shop-800355ab3f46.herokuapp.com/api/user/${itemId}/review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      // Check if response is okay
      if (!res.ok) {
        throw new Error("Server error while submitting review");
      }

      // Parse response (important!)
      const data = await res.json();

      messageApi.success("Review submitted!");
      setComment("");
      setRating(0);

      if (onReviewAdded) onReviewAdded(data);
      if (onClose) onClose();

      await fetchData();
    } catch (error) {
      messageApi.error(error.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card bordered={false} className="shadow-lg rounded-2xl bg-white">
      {/* Header */}
      {contextHolder}
      <div className="flex items-center space-x-2 mb-2">
        <StarFilled className="text-yellow-500 text-xl" />
        <h3 className="text-lg font-semibold text-gray-800">Leave a Review</h3>
      </div>

      <Divider className="my-3" />

      <div className="flex flex-col space-y-5">
        {/* Rating */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Your Rating
          </label>
          <Rate value={rating} onChange={setRating} className="text-lg" />
        </div>

        {/* Comment */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <MessageOutlined /> Your Comment
          </label>
          <Input.TextArea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review..."
            rows={4}
            className="rounded-lg"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="primary"
          loading={loading}
          size="large"
          className="w-full rounded-lg bg-blue-600 hover:bg-blue-700"
          onClick={() => handleSubmit()}
        >
          Submit Review
        </Button>
      </div>
    </Card>
  );
}

export default function MyOrdersPage() {
  const location = useLocation();
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get("tab") || "1";
  const { loginData, setLoginData } = useContext(LoginContext);
  const history = useNavigate();

  const fetchData = async () => {
    try {
      const res = await fetch(
        `https://eyefit-shop-800355ab3f46.herokuapp.com/api/users/orders?userId=${loginData?.body?._id}`
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
        (item.paymentMethod === "Cash on Delivery" ||
          item.paymentMethod === "Debit/Credit Card")) ||
      item.status === "Processing"
  );
  const shipped = data.filter((item) => item.status === "Shipped");
  const review = data.filter(
    (item) => item.status === "Completed" && !item.ratingStatus
  );
  const completed = data.filter(
    (item) => item.status === "Completed" && item.ratingStatus
  );
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
                src={prod?.product?.variants[0]?.images[0]?.url}
                alt={prod?.product?.productName}
                className="w-16 h-16 object-cover rounded-md border border-gray-200"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-800">
                  {prod?.product?.productName}
                </p>
                <p className="text-sm text-gray-500">
                  Color: {prod?.color} | Qty: {prod?.quantity}
                </p>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                ₱{prod?.product?.price.toLocaleString()}
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
            (order.status === "Pending" &&
              order.paymentMethod !== "Debit/Credit Card") ||
            (order.status === "Completed" && !order.ratingStatus)
              ? "justify-between"
              : "justify-end"
          }`}
        >
          {order.status === "Pending" &&
            order.paymentMethod !== "Debit/Credit Card" && (
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

          {order.status === "Completed" && !order.ratingStatus && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-2.5 
                  text-black font-semibold rounded-full 
                 shadow-md transition-all duration-300 hover:shadow-lg active:scale-95 
                 text-xs sm:text-sm md:text-base"
            >
              <StarOutlined className="text-lg" />
              RATE ORDER
            </button>
          )}
          <p className="text-lg font-bold text-gray-900">
            Total: ₱{order.total.toLocaleString()}
          </p>
        </div>

        {order.ratingStatus && (
          <div className="mt-6 p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-md shadow">
                  Review
                </span>
                Your Feedback
              </h4>
              <span className="text-xs text-gray-500">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <Rate disabled defaultValue={order.rating} />
              <span className="text-sm font-medium text-gray-700">
                {order.rating} / 5
              </span>
            </div>

            {/* Comment */}
            <div className="bg-white rounded-lg border border-gray-100 p-3 shadow-inner">
              <p className="text-gray-700 text-sm italic leading-relaxed">
                “{order.comment}”
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>

            {/* Reviewer Info (optional) */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-white font-semibold">
                {loginData?.body?.name?.charAt(0) || "U"}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {loginData?.body?.name || "Anonymous"}
                </p>
                <p className="text-xs text-gray-500">Verified Buyer</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-4">
          {/* Modal */}
          <Modal
            title="Rate this Item"
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={null} // hide default footer
            className="max-w-md mx-auto"
          >
            <ReviewForm
              itemId={order._id}
              userId={loginData?.body?._id}
              onReviewAdded={() => console.log("review added")}
              onClose={() => setIsModalOpen(false)}
              fetchData={fetchData}
            />
          </Modal>
        </div>
      </Card>
    ));
  };

  // 🔹 Tabs
  const tabItems = [
    {
      key: "1",
      label: (
        <span className="flex items-center gap-2">
          <WalletOutlined /> To Pay
          <Badge
            count={toPay.length}
            style={{ backgroundColor: "#1677ff" }}
            className="ml-1"
          />
        </span>
      ),
      children: renderOrderList(toPay),
    },
    {
      key: "2",
      label: (
        <span className="flex items-center gap-2">
          <GiftOutlined /> To Ship
          <Badge
            count={toShip.length}
            style={{ backgroundColor: "#faad14" }}
            className="ml-1"
          />
        </span>
      ),
      children: renderOrderList(toShip),
    },
    {
      key: "3",
      label: (
        <span className="flex items-center gap-2">
          <CarOutlined /> To Receive
          <Badge
            count={shipped.length}
            style={{ backgroundColor: "#13c2c2" }}
            className="ml-1"
          />
        </span>
      ),
      children: renderOrderList(shipped),
    },
    {
      key: "4",
      label: (
        <span className="flex items-center gap-2">
          <StarOutlined /> To Review
          <Badge
            count={review.length}
            style={{ backgroundColor: "#eb2f96" }}
            className="ml-1"
          />
        </span>
      ),
      children: renderOrderList(review),
    },
    {
      key: "5",
      label: (
        <span className="flex items-center gap-2">
          <CheckCircleOutlined /> Completed
          <Badge
            count={completed.length}
            style={{ backgroundColor: "#52c41a" }}
            className="ml-1"
          />
        </span>
      ),
      children: renderOrderList(completed),
    },
    {
      key: "6",
      label: (
        <span className="flex items-center gap-2">
          <StopOutlined /> Cancelled
          <Badge
            count={cancelled.length}
            style={{ backgroundColor: "#ff4d4f" }}
            className="ml-1"
          />
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
      <Tabs
        defaultActiveKey={activeTab}
        items={tabItems}
        className="custom-tabs"
      />
      ;
    </div>
  );
}
