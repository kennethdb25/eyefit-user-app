import React, { useContext, useEffect, useState } from "react";
import {
  SettingOutlined,
  UserOutlined,
  WalletOutlined,
  GiftOutlined,
  CarOutlined,
  StarOutlined,
  StopOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  HeartFilled,
  EyeFilled,
  LogoutOutlined,
  LeftOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import { Modal } from "antd";
import { LoginContext } from "../context/LoginContext";

const AccountInformationModal = ({ open, onClose, user }) => {
  return (
    <Modal
      open={open}
      footer={null}
      closable={false}
      width="100%"
      style={{ top: 0, padding: 0 }}
      styles={{ padding: 0 }}
      className="max-w-md mx-auto"
    >
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-green-200 py-4 flex items-center justify-between px-4 border-b">
          <button onClick={onClose}>
            <LeftOutlined className="text-lg" />
          </button>
          <h2 className="text-lg font-semibold">Account Information</h2>
          <div className="w-6" /> {/* Spacer for symmetry */}
        </div>

        {/* Profile Photo */}
        <div className="flex justify-center mt-6 relative">
          <div className="w-24 h-24 bg-white border rounded-full flex items-center justify-center relative">
            <img
              src={user?.avatar || ""}
              alt=""
              className="w-full h-full rounded-full object-cover"
            />
            <button className="absolute bottom-1 right-1 bg-black text-white p-1 rounded-full">
              <CameraOutlined className="text-sm" />
            </button>
          </div>
        </div>

        {/* Info List */}
        <div className="mt-8 px-4 space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <span className="text-gray-700">Full Name</span>
            <span className="text-gray-900">{user?.name || "User Name"}</span>
          </div>

          <div className="flex justify-between items-center border-b pb-3">
            <span className="text-gray-700">EyeFit ID</span>
            <span className="text-gray-900">
              {user?.eyefitId || "000000000"}
            </span>
          </div>

          <div className="flex justify-between items-center border-b pb-3">
            <span className="text-gray-700">Email</span>
            <span className="text-gray-900">
              {user?.email || "email@example.com"}
            </span>
          </div>

          <div className="flex justify-between items-center border-b pb-3">
            <span className="text-gray-700">Change Password</span>
            <span className="text-gray-900">&gt;</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const Account = () => {
  const { loginData, setLoginData } = useContext(LoginContext);
  const [data, setData] = useState([]);
  const [likeData, setLikeData] = useState([]);
  const [recentlyViewData, setRecentlyViewData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const showModal = () => setIsModalVisible(true);
  const hideModal = () => setIsModalVisible(false);

  const userData = {
    name: loginData?.body?.name,
    email: loginData?.body?.email,
    eyefitId: loginData?.body?._id,
    avatar: "",
  };

  const appointments = [
    {
      _id: "1",
      customerName: "ISMAEL DOE",
      address: "251 PUROK TALDAWA - PALIGUI, APALIT, PAMPANGA",
      contact: "+639171672449",
      email: "test@test.com",
      order: "TEST",
      date: "2025-09-08T00:00:00.000Z",
      time: "09:00AM",
      status: "Pending",
      company: "EO APALIT",
    },
    {
      _id: "2",
      customerName: "JOHN DOE",
      address: "123 Main Street, City",
      contact: "+639171111111",
      email: "john@test.com",
      order: "TEST",
      date: "2025-09-09T00:00:00.000Z",
      time: "11:00AM",
      status: "Completed",
      company: "EO MANILA",
    },
    {
      _id: "3",
      customerName: "JANE DOE",
      address: "456 Elm Street, City",
      contact: "+639172222222",
      email: "jane@test.com",
      order: "TEST",
      date: "2025-09-10T00:00:00.000Z",
      time: "02:00PM",
      status: "Cancelled",
      company: "EO PAMPANGA",
    },
  ];

  const handleLogout = () => {
    console.log("Logout clicked");
    // Add your logout logic here
    handleCloseModal();
  };

  const renderCard = (appt) => (
    <div
      key={appt._id}
      className="bg-white shadow-sm rounded-xl p-4 border hover:shadow-md transition"
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-lg font-semibold text-gray-800">
            {appt.company}
          </h4>
          <p className="text-sm text-gray-600">
            {appt.customerName} • {appt.contact}
          </p>
          <p className="text-sm text-gray-600">{appt.email}</p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            appt.status === "Pending"
              ? "bg-yellow-100 text-yellow-700"
              : appt.status === "Completed"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {appt.status}
        </span>
      </div>

      <div className="flex items-center text-sm text-gray-600 mt-2">
        <CalendarOutlined className="mr-2 text-green-500" />
        {new Date(appt.date).toLocaleDateString()}
      </div>
      <div className="flex items-center text-sm text-gray-600 mt-1">
        <ClockCircleOutlined className="mr-2 text-blue-500" />
        {appt.time}
      </div>
      <div className="flex items-center text-sm text-gray-600 mt-1">
        <EnvironmentOutlined className="mr-2 text-red-500" />
        {appt.address}
      </div>
    </div>
  );

  const fetchData = async () => {
    try {
      const res = await fetch(
        // https://eyefit-shop-800355ab3f46.herokuapp.com
        `/api/users/orders?userId=${loginData?.body?._id}`
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
      const res = await fetch(`/api/users/like?userId=${loginData?.body?._id}`);
      const json = await res.json();
      setLikeData(json.body || []); // assuming your API responds with { body: [...] }
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  const fetchRecentlyViewData = async () => {
    try {
      // https://eyefit-shop-800355ab3f46.herokuapp.com
      const res = await fetch(`/api/users/view?userId=${loginData?.body?._id}`);
      const json = await res.json();
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
        <button onClick={handleOpenModal}>
          <SettingOutlined className="text-xl hover:text-green-800 transition-colors" />
        </button>
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
        {/* Likes Section */}
        <div className="flex justify-start items-center mb-2 mt-5">
          <h3 className="font-semibold mr-1">Likes</h3>
          <HeartFilled className="text-red-500 text-xl" />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {likeData?.map((i) => (
            <img
              key={i._id}
              src={i?.product?.productImgURL}
              alt={`Product ${i.product.productName}`}
              className="w-full h-24 rounded-lg object-cover"
            />
          ))}
        </div>
      </div>

      {/* Recently Viewed Section */}
      <div className="px-4 mb-4">
        <div className="flex justify-start items-center mb-2 mt-5">
          <h3 className="font-semibold mr-1">Recently Viewed</h3>
          <EyeFilled className="text-blue-500 text-xl" />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {recentlyViewData?.map((i) => (
            <img
              key={i._id}
              src={i?.product?.productImgURL}
              alt={`Product ${i.product.productName}`}
              className="w-full h-24 rounded-lg object-cover"
            />
          ))}
        </div>
      </div>
      <div className="px-4 mb-4 pb-24">
        <div className="flex justify-between items-center mb-2 mt-5">
          <h3 className="font-semibold">My Appointments</h3>
          {appointments.length > 2 && (
            <button
              onClick={showModal}
              className="text-sm text-green-600 hover:underline"
            >
              View More &gt;
            </button>
          )}
        </div>

        {appointments.length > 0 ? (
          <div className="space-y-3">
            {appointments.slice(0, 2).map(renderCard)}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No appointments found.</p>
        )}
      </div>
      {/* Modal for all appointments */}
      <Modal
        title="All Appointments"
        open={isModalVisible}
        onCancel={hideModal}
        footer={null}
        centered
        style={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        <div className="space-y-3">{appointments.map(renderCard)}</div>
      </Modal>

      {/* Settings Modal */}
      <Modal
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        centered
        className="rounded-2xl overflow-hidden"
      >
        <div className="p-6 flex flex-col justify-between min-h-[300px]">
          {/* Settings List */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Settings</h2>
            <ul className="space-y-4">
              <li
                onClick={() => setIsOpen(true)}
                className="flex justify-between items-center cursor-pointer hover:bg-gray-100 p-2 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <UserOutlined />
                  <span>Account Information</span>
                </div>
                <span>&gt;</span>
              </li>
              <li className="flex justify-between items-center cursor-pointer hover:bg-gray-100 p-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <SettingOutlined />
                  <span>Setting</span>
                </div>
                <span>&gt;</span>
              </li>
            </ul>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2 mt-6 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md transition"
          >
            <LogoutOutlined />
            Logout
          </button>
        </div>
      </Modal>

      <AccountInformationModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        user={userData}
      />
    </div>
  );
};

export default Account;
