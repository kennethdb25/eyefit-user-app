import React, { useContext, useEffect, useState } from "react";
import {
  EyeInvisibleOutlined,
  CheckCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { LoginContext } from "../context/LoginContext";
import { message } from "antd";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const { loginData, setLoginData } = useContext(LoginContext);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchData = async () => {
    try {
      const res = await fetch(
        // https://eyefit-shop-800355ab3f46.herokuapp.com
        `https://eyefit-shop-800355ab3f46.herokuapp.com/api/user/notification?userId=${loginData?.body?._id}`
      );
      const json = await res.json();
      setNotifications(json.body || []); // assuming your API responds with { body: [...] }
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Delete a single notification
  const readNotification = async (id) => {
    try {
      // https://eyefit-shop-800355ab3f46.herokuapp.com
      const res = await fetch(
        `https://eyefit-shop-800355ab3f46.herokuapp.com/api/user/notification?notificationId=${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const json = await res.json();

      if (json.success) {
        messageApi.success("Mark As Read!"); // popup toast
      }
    } catch (error) {
      console.error("Fetch failed:", error);
    } finally {
      fetchData();
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      {contextHolder}
      <div className="bg-green-200 p-6 rounded-b-3xl flex justify-between items-center">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <button
          onClick={markAllAsRead}
          className="text-green-800 text-sm font-medium hover:underline"
        >
          Mark All as Read
        </button>
      </div>

      {/* Notification List */}
      <div className="flex-1 p-4 space-y-3">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`flex justify-between items-center p-3 rounded-lg shadow-sm border ${
                n.userRead ? "bg-gray-100" : "bg-white"
              }`}
              onClick={() => {
                if (!n.userRead) {
                  readNotification(n._id);
                }
              }}
            >
              <div className="flex items-center space-x-3">
                {!n.userRead && (
                  <CheckCircleOutlined className="text-green-600" />
                )}
                <p
                  className={`text-sm ${
                    n.userRead ? "text-gray-500" : "text-black font-medium"
                  }`}
                >
                  {n?.message}
                </p>
              </div>
              {!n.userRead && <EyeInvisibleOutlined className="text-red-500" />}

              {n.userRead && <EyeOutlined className="text-red-500" />}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No notifications</p>
        )}
      </div>
    </div>
  );
};

export default Notifications;
