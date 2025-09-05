import React, { useContext } from "react";
import { SettingOutlined, UserOutlined } from "@ant-design/icons";
import { LoginContext } from "../context/LoginContext";

const Account = () => {
  const { loginData, setLoginData } = useContext(LoginContext);

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
        <div className="flex justify-between">
          {["To Pay", "To Ship", "To Receive", "To Review", "Cancellation"].map(
            (item) => (
              <div key={item} className="flex flex-col items-center">
                <div className="bg-green-600 w-12 h-6 rounded-md mb-1"></div>
                <p className="text-xs text-center">{item}</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Likes Section */}
      <div className="px-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Likes</h3>
          <p className="text-sm text-gray-500">View More &gt;</p>
        </div>
        <div className="flex space-x-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-20 h-24 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>

      {/* Recently Viewed Section */}
      <div className="px-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Recently Viewed</h3>
          <p className="text-sm text-gray-500">View More &gt;</p>
        </div>
        <div className="flex space-x-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-20 h-24 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Account;
