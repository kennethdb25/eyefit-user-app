/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
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
import { Modal, message, Popconfirm } from "antd";
import { LoginContext } from "../context/LoginContext";
import { ToastContainer, toast, Bounce } from "react-toastify";

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
              alt="profile"
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
            <span className="text-gray-700">Address</span>
            <span className="text-gray-700">
              {user?.address || "email@example.com"}
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

const Account = (props) => {
  const { loginData, setLoginData } = useContext(LoginContext);
  const [orderData, setOrderData] = useState([]);
  const [likeData, setLikeData] = useState([]);
  const [recentlyViewData, setRecentlyViewData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const history = useNavigate();
  const { setData } = props;

  const [messageApi, contextHolder] = message.useMessage();

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const showModal = () => setIsModalVisible(true);
  const hideModal = () => setIsModalVisible(false);

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4, // show 4 images at once
    slidesToScroll: 4, // move 4 images per click
    nextArrow: (
      <button className="absolute right-0 z-10 p-2 bg-transparent">➡️</button>
    ),
    prevArrow: (
      <button className="absolute left-0 z-10 p-2 bg-transparent">⬅️</button>
    ),
  };

  const fetchAppointmentData = async () => {
    try {
      const res = await fetch(
        `https://eyefit-shop-800355ab3f46.herokuapp.com/api/users/appointments?email=${loginData?.body?.email}`
      );
      const json = await res.json();
      setAppointments(json.body || []);
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  const userData = {
    name: loginData?.body?.name,
    email: loginData?.body?.email,
    address: loginData?.body?.address,
    eyefitId: loginData?.body?._id,
    avatar: "",
  };

  const handleUpdateStatus = async (status, id) => {
    if (status === "Pending") {
      messageApi.warning("Please select a valid status.");
      return;
    }

    try {
      // const response = await fetch(`https://eyefit-shop-800355ab3f46.herokuapp.com/api/appointments/status/${id}`, {
      const response = await fetch(
        `https://eyefit-shop-800355ab3f46.herokuapp.com/api/appointments/status/${id}`,
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
      await fetchAppointmentData();
      setIsModalVisible(false);
      messageApi.success(`Appointment ${status} successfully`);
    } catch (error) {
      messageApi.error(error.message);
    }
  };

  const handleLogout = async () => {
    console.log("Logout clicked");
    let token = localStorage.getItem("accountUserToken");
    // const res = await fetch("https://eyefit-shop-800355ab3f46.herokuapp.com/api/users/logout", {
    const res = await fetch(
      "https://eyefit-shop-800355ab3f46.herokuapp.com/api/users/logout",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
          Accept: "application/json",
        },
      }
    );

    const data = await res.json();

    if (data.success) {
      setData(false);
      setTimeout(() => {
        localStorage.removeItem("accountUserToken");
        localStorage.removeItem("hasSeenOnboarding");
        history("/");
        setLoginData(null);
        setData(true);
      }, 3000);
    } else {
      toast.error(res.body, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    }
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

      {/* Cancel Button if Pending */}
      {appt.status === "Pending" && (
        <div className="flex justify-end mt-4">
          <Popconfirm
            title="Cancel Appointment"
            description="Are you sure to cancel this appointment?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleUpdateStatus("Cancelled", appt?._id)}
          >
            <button className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition">
              Cancel
            </button>
          </Popconfirm>
        </div>
      )}
    </div>
  );

  const fetchData = async () => {
    try {
      const res = await fetch(
        //
        `https://eyefit-shop-800355ab3f46.herokuapp.com/api/users/orders?userId=${loginData?.body?._id}`
      );
      const json = await res.json();
      setOrderData(json.body || []);
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  const fetchLikeData = async () => {
    try {
      //
      const res = await fetch(
        `https://eyefit-shop-800355ab3f46.herokuapp.com/api/users/like?userId=${loginData?.body?._id}`
      );
      const json = await res.json();
      setLikeData(json.body || []);
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  const fetchRecentlyViewData = async () => {
    try {
      //
      const res = await fetch(
        `https://eyefit-shop-800355ab3f46.herokuapp.com/api/users/view?userId=${loginData?.body?._id}`
      );
      const json = await res.json();
      setRecentlyViewData(json.body || []);
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  const toPayCount = orderData.filter(
    (item) =>
      item.status === "Pending" && item.paymentMethod === "Over the counter"
  );
  const toShipCount = orderData.filter(
    (item) =>
      (item.status === "Pending" &&
        (item.paymentMethod === "Cash on Delivery" ||
          item.paymentMethod === "Debit/Credit Card")) ||
      item.status === "Processing"
  );
  const shippedCount = orderData.filter((item) => item.status === "Shipped");
  const reviewCount = orderData.filter(
    (item) => item.status === "Completed" && !item.ratingStatus
  );
  const cancelledCount = orderData.filter(
    (item) => item.status === "Cancelled"
  );

  useEffect(() => {
    fetchData();
    fetchLikeData();
    fetchRecentlyViewData();
    fetchAppointmentData();
  }, [loginData]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {contextHolder}
      <ToastContainer />
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
          {/* 🔹 To Pay */}
          <Link to="/my-orders?tab=1" className="flex flex-col items-center">
            <div className="mb-1 relative">
              <WalletOutlined className="text-lg text-green-600" />
              {toPayCount.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {toPayCount.length}
                </span>
              )}
            </div>
            <p className="text-xs text-center">To Pay</p>
          </Link>

          {/* 🔹 To Ship */}
          <Link to="/my-orders?tab=2" className="flex flex-col items-center">
            <div className="mb-1 relative">
              <GiftOutlined className="text-lg text-green-600" />
              {toShipCount.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {toShipCount.length}
                </span>
              )}
            </div>
            <p className="text-xs text-center">To Ship</p>
          </Link>

          {/* 🔹 To Receive */}
          <Link to="/my-orders?tab=3" className="flex flex-col items-center">
            <div className="mb-1 relative">
              <CarOutlined className="text-lg text-green-600" />
              {shippedCount.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {shippedCount.length}
                </span>
              )}
            </div>
            <p className="text-xs text-center">To Receive</p>
          </Link>

          {/* 🔹 To Review */}
          <Link to="/my-orders?tab=4" className="flex flex-col items-center">
            <div className="mb-1 relative">
              <StarOutlined className="text-lg text-green-600" />
              {reviewCount.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {reviewCount.length}
                </span>
              )}
            </div>
            <p className="text-xs text-center">To Review</p>
          </Link>

          {/* 🔹 Cancelled */}
          <Link to="/my-orders?tab=6" className="flex flex-col items-center">
            <div className="mb-1 relative">
              <StopOutlined className="text-lg text-green-600" />
              {cancelledCount.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cancelledCount.length}
                </span>
              )}
            </div>
            <p className="text-xs text-center">Cancelled</p>
          </Link>
        </div>
      </div>

      {/* Likes Section */}
      <div className="px-4 mb-4">
        {/* Likes Section */}
        <div className="flex justify-start items-center mb-2 mt-5">
          <h3 className="font-semibold mr-1">Likes</h3>
          <HeartFilled className="text-red-500 text-xl" />
        </div>

        {likeData.length > 0 ? (
          <Slider {...settings}>
            {likeData.map((i) => (
              <div key={i._id} className="px-2">
                <img
                  src={i?.product?.variants[0]?.images[0]?.url}
                  alt={`Product ${i.product.productName}`}
                  className="w-full h-24 rounded-lg object-cover"
                />
              </div>
            ))}
          </Slider>
        ) : (
          <div className="col-span-4 flex flex-col items-center justify-center p-6 rounded-xl bg-gray-50 border border-gray-200 shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 text-red-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <p className="text-gray-600 font-medium text-lg mb-1">
              No Liked Products
            </p>
            <p className="text-gray-500 text-sm text-center">
              Tap the heart icon on products you love, and they’ll appear here.
            </p>
          </div>
        )}
      </div>

      {/* Recently Viewed Section */}
      <div className="px-4 mb-4">
        <div className="flex justify-start items-center mb-2 mt-5">
          <h3 className="font-semibold mr-1">Recently Viewed</h3>
          <EyeFilled className="text-blue-500 text-xl" />
        </div>

        {recentlyViewData.length === 0 ? (
          // 🔹 Empty state
          <div className="col-span-4 flex flex-col items-center justify-center p-6 rounded-xl bg-gray-50 border border-gray-200 shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 text-gray-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.5c-4.418 0-8 3.134-8 7s3.582 7 8 7 8-3.134 8-7-3.582-7-8-7z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11.25a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="text-gray-600 font-medium text-lg mb-1">
              No Recently Viewed
            </p>
            <p className="text-gray-500 text-sm text-center">
              Start exploring products and they’ll show up here.
            </p>
          </div>
        ) : recentlyViewData.length >= 4 ? (
          // 🔹 Carousel view (4 per row)
          <Slider {...settings}>
            {recentlyViewData.map((i) => (
              <div key={i._id} className="p-2">
                <img
                  src={
                    i?.product?.variants[0]?.images[0]?.url || "/glasses.png"
                  }
                  alt={`Product ${i.product?.productName}`}
                  className="w-full h-24 rounded-lg object-cover"
                />
              </div>
            ))}
          </Slider>
        ) : (
          // 🔹 Grid view (if less than 4)
          <div className="grid grid-cols-4 gap-3">
            {recentlyViewData.map((i) => (
              <img
                key={i._id}
                src={i?.product?.productImgURL}
                alt={`Product ${i.product?.productName}`}
                className="w-full h-24 rounded-lg object-cover"
              />
            ))}
          </div>
        )}
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
          <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-gray-50 border border-gray-200 shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 text-gray-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10m-12 8h14a2 2 0 002-2V7a2 2 0 
      00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-600 font-medium text-lg mb-1">
              No Appointments
            </p>
            <p className="text-gray-500 text-sm text-center">
              You don’t have any scheduled appointments yet.
            </p>
          </div>
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
