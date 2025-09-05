import React, { useState } from "react";
import { DeleteOutlined, CheckCircleOutlined } from "@ant-design/icons";

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Your order #1234 has been shipped!", read: false },
    { id: 2, text: "You received a 10% discount coupon.", read: false },
    { id: 3, text: "Your return request was approved.", read: true },
  ]);

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Delete a single notification
  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
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
              key={n.id}
              className={`flex justify-between items-center p-3 rounded-lg shadow-sm border ${
                n.read ? "bg-gray-100" : "bg-white"
              }`}
            >
              <div className="flex items-center space-x-3">
                {!n.read && <CheckCircleOutlined className="text-green-600" />}
                <p
                  className={`text-sm ${
                    n.read ? "text-gray-500" : "text-black font-medium"
                  }`}
                >
                  {n.text}
                </p>
              </div>
              <DeleteOutlined
                className="text-red-500 cursor-pointer"
                onClick={() => deleteNotification(n.id)}
              />
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
