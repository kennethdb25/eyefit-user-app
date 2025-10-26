/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../context/LoginContext";
import {
  Button,
  Input,
  Card,
  Radio,
  Modal,
  message,
  Tooltip,
  Popconfirm,
} from "antd";
import {
  DeleteOutlined,
  LeftOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCcPaypal } from "react-icons/fa";

export default function CartPage(props) {
  const { cartItems, setCartItems, cartData } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("otc"); // default value
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvc, setCvc] = useState("");

  const { loginData, setLoginData } = useContext(LoginContext);
  const [address, setAddress] = useState(`${loginData?.body?.address}`);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tempAddress, setTempAddress] = useState(address);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [loadingOrderButton, setLoadingOrderButton] = useState(false);
  const history = useNavigate();

  const showModal = () => setIsModalOpen(true);
  const handleClose = () => {
    setIsModalOpen(false);
    setPaymentMethod("otc");
  };

  const acceptedCards = [
    { name: "Visa", icon: <FaCcVisa className="w-12 h-8 text-blue-500" /> },
    {
      name: "Mastercard",
      icon: <FaCcMastercard className="w-12 h-8 text-red-500" />,
    },
    { name: "Amex", icon: <FaCcAmex className="w-12 h-8 text-green-500" /> },
    { name: "Paypal", icon: <FaCcPaypal className="w-12 h-8 text-blue-700" /> },
  ];

  const checkTotal = async () => {
    const withTotals = cartItems.map((p) => ({
      ...p,
      totalPrice: p.quantity ? p?.product.price * p.quantity : p?.product.price,
    }));

    const grandTotal = withTotals.reduce(
      (acc, item) => acc + item.totalPrice,
      0
    );

    setOrderTotal(grandTotal);
  };

  const updateQuantityAPI = async (id, quantity) => {
    try {
      await fetch(`/api/user/checkout/${id}/quantity`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  // Increment
  const handleIncrement = async (index) => {
    const updatedCart = [...cartItems];
    if (!updatedCart[index].quantity) updatedCart[index].quantity = 1;

    if (updatedCart[index].quantity < updatedCart[index].product.stocks) {
      updatedCart[index].quantity += 1;
      setCartItems(updatedCart);
      checkTotal();

      // Call API
      await updateQuantityAPI(
        updatedCart[index]._id,
        updatedCart[index].quantity
      );
    }
  };

  const handleDecrement = async (index) => {
    const updatedCart = [...cartItems];
    if (!updatedCart[index].quantity) updatedCart[index].quantity = 1;

    if (updatedCart[index].quantity > 1) {
      updatedCart[index].quantity -= 1;
      setCartItems(updatedCart);
      checkTotal();

      // Call API
      await updateQuantityAPI(
        updatedCart[index]._id,
        updatedCart[index].quantity
      );
    }
  };

  const handleRadioChange = (e) => {
    console.log("Selected value:", e.target.value);
    setPaymentMethod(e.target.value);
  };

  const handleCheckOut = () => {
    checkTotal();
    showModal();
  };

  const handleEditClick = () => {
    setTempAddress(address);
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    // setAddress(tempAddress);
    // setIsModalVisible(false);
    try {
      setLoading(true);
      const response = await fetch(
        `/api/users/address/${loginData?.body?._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address: tempAddress }),
        }
      );
      const res = await response.json();
      if (res.success) {
        setAddress(res?.body?.address);
        setIsModalVisible(false);
        messageApi.success("Address successfully saved!");
      } else {
        messageApi.error(res?.error || "Something went wrong");
      }
    } catch (error) {
      messageApi.error(error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    setLoadingOrderButton(true);
    if (paymentMethod === "card") {
      try {
        // 1. Create Payment Intent (backend)
        const intentRes = await fetch("/api/user/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: orderTotal * 100 }), // convert pesos → centavos
        });
        const intentData = await intentRes.json();
        const intentId = intentData.body?.data?.id;

        // 2. Create Card Payment Method (frontend, public key)
        const pmRes = await fetch(
          "https://api.paymongo.com/v1/payment_methods",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "Basic " + btoa("pk_test_F6FJrUNiVzNEVR1aJzoq771J"), // your PUBLIC key
            },
            body: JSON.stringify({
              data: {
                attributes: {
                  details: {
                    card_number: cardNumber.replace(/\D/g, ""),
                    exp_month: parseInt(expMonth),
                    exp_year: parseInt(expYear),
                    cvc: cvc,
                  },
                  type: "card",
                },
              },
            }),
          }
        );
        const pmData = await pmRes.json();
        const paymentMethodId = pmData?.data?.id;

        // 3. Attach Payment Method to Intent (backend, secret key)
        const attachRes = await fetch(
          `https://api.paymongo.com/v1/payment_intents/${intentId}/attach`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "Basic " + btoa("sk_test_WP1FKzGNZwVitiwi53116N7X"), // SECRET key
            },
            body: JSON.stringify({
              data: {
                attributes: {
                  payment_method: paymentMethodId,
                },
              },
            }),
          }
        );

        const finalData = await attachRes.json();
        console.log("Payment result:", finalData);
        messageApi.success("Payment successful!");

        try {
          const payload = {
            userId: cartItems[0]?.user?._id || null, // Get userId from the first object
            paymentMethod,
            paymentDetails: intentData?.body?.data,
            products: cartItems.map((item) => ({
              productId: item.product._id,
              quantity: parseInt(item.quantity) || 1,
              color: item.color,
            })),
          };

          if (!payload || cartItems.length === 0) {
            return messageApi.info("No order in Cart");
          }
          console.log(intentData?.body?.data);
          const response = await fetch("/api/orders", {
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          const res = await response.json();

          if (res.success) {
            messageApi.success("Order Placed Successfully!");
            cartData();
            handleRemoveAllItem(false);
            setPaymentMethod("otc");
          } else {
            messageApi.error(
              res?.error || res.message || "Something went wrong"
            );
          }
        } finally {
          setLoadingOrderButton(false);
        }
      } catch (err) {
        console.error(err);
        alert("Payment failed");
      }
    }
  };

  const handleRemoveItem = async (checkoutId) => {
    try {
      const data = await fetch(
        `/api/user/remove/checkout?checkoutId=${checkoutId}`,
        {
          method: "DELETE",
        }
      );

      const res = await data.json();

      if (res.success) {
        messageApi.success("Item removed successfully!");
        await cartData(); // This should update cartItems
      } else {
        messageApi.error(res?.error || "Something went wrong");
      }
    } catch (error) {
      messageApi.error(error?.message || "Something went wrong");
    }
  };

  const handleRemoveAllItem = async (toShow) => {
    const data = await fetch(
      `/api/user/remove/all/checkout?userId=${loginData?.body?._id}`,
      {
        method: "DELETE",
      }
    );

    const res = await data.json();

    if (res.success) {
      if (toShow) {
        messageApi.success("All item(s) removed successfully!");
      }
      cartData();
      checkTotal();
    } else {
      messageApi.error(res?.error || "Something went wrong");
    }
  };

  useEffect(() => {
    checkTotal();
  }, [cartItems]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {contextHolder}

      {/* Header */}
      <div className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md p-4 flex items-center shadow z-50">
        <button
          onClick={() => history("/home")}
          className="mr-3 p-2 rounded-full hover:bg-gray-100 transition"
        >
          <span className="text-lg">←</span>
        </button>
        <h1 className="text-xl font-bold text-gray-800">My Cart</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 mt-20">
        {cartItems.length === 0 ? (
          /* ---------- Empty State ---------- */
          <div className="flex flex-col items-center justify-center h-[70vh] text-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/102/102661.png"
              alt="Empty cart"
              className="w-32 h-32 mb-6 opacity-60"
            />
            <h2 className="text-lg font-semibold text-gray-700">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mt-2 text-sm max-w-xs">
              Looks like you haven’t added anything yet. Browse our collection
              and start shopping now.
            </p>
            <button
              onClick={() => history("/home")}
              className="mt-6 bg-gradient-to-r from-green-400 to-green-500 
                     hover:from-green-500 hover:to-green-600 text-white 
                     px-8 py-3 rounded-full shadow-lg transition-all duration-300"
            >
              Shop Now
            </button>
          </div>
        ) : (
          <>
            {/* ---------- Cart Items ---------- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {cartItems.map((item, index) => (
                <div
                  key={index}
                  className="w-full bg-white rounded-2xl shadow-sm hover:shadow-md 
                         transition-all duration-300 p-4 flex flex-col"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-28 h-28 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                      <img
                        src={
                          item?.product?.variants[0]?.images[0]?.url ||
                          "/glasses.png"
                        }
                        alt={item?.product.productName}
                        className="w-24 h-24 object-contain"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700">
                          {item?.product.brand}
                        </h3>
                        <p className="text-gray-900 text-sm font-bold">
                          {item?.product.model}
                        </p>
                        <p className="text-green-700 text-sm font-bold">
                          ₱{item?.product.price}
                        </p>
                        <p className="text-xs text-gray-500">
                          Shop: {item?.product.company}
                        </p>
                        <p className="text-xs text-gray-500">
                          Stock: {item?.product.stocks}
                        </p>
                        <p className="text-xs text-gray-500">
                          Color: {item?.color.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quantity + Remove */}
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDecrement(index)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-lg font-bold transition"
                      >
                        −
                      </button>
                      <span className="px-3 text-gray-800 font-medium">
                        {item.quantity || 1}
                      </span>
                      <button
                        onClick={() => handleIncrement(index)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-lg font-bold transition"
                      >
                        +
                      </button>
                    </div>

                    <Tooltip title="Remove item">
                      <Popconfirm
                        title="Remove Item"
                        description="Are you sure to remove this item?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => handleRemoveItem(item?._id)}
                      >
                        <button className="text-red-600 hover:text-red-700 transition text-sm font-semibold">
                          Remove
                        </button>
                      </Popconfirm>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>

            {/* ---------- Checkout Bar ---------- */}
            <div className="sticky bottom-[64px] bg-white shadow-lg p-4 z-40 rounded-t-xl">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                {/* Total Price */}
                <span className="text-lg font-semibold text-gray-800">
                  Total: ₱
                  {cartItems.reduce(
                    (acc, item) => acc + item.product.price * item.quantity,
                    0
                  )}
                </span>

                {/* Buttons */}
                <div className="flex gap-3 flex-wrap justify-center sm:justify-end">
                  <Popconfirm
                    title="Remove All Items"
                    description="Are you sure you want to clear your cart?"
                    okText="Yes"
                    cancelText="No"
                    onConfirm={() => handleRemoveAllItem(true)}
                  >
                    <button
                      className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-full 
                 shadow-[0_4px_0_#991b1b] hover:shadow-[0_6px_0_#7f1d1d] 
                 active:shadow-[0_2px_0_#991b1b] active:translate-y-0.5 
                 transition-all duration-200 ease-in-out"
                    >
                      <DeleteOutlined />
                      Clear
                    </button>
                  </Popconfirm>

                  <button
                    onClick={() => {
                      setIsModalOpen(true);
                      handleCheckOut();
                    }}
                    className="flex items-center gap-2 px-7 py-2.5 bg-green-600 text-white font-semibold rounded-full 
               shadow-[0_4px_0_#14532d] hover:shadow-[0_6px_0_#064e3b] 
               active:shadow-[0_2px_0_#14532d] active:translate-y-0.5 
               transition-all duration-200 ease-in-out"
                  >
                    <ShoppingCartOutlined />
                    Checkout
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Checkout Modal */}
      <Modal
        open={isModalOpen}
        onCancel={handleClose}
        footer={null}
        closable={false} // 👈 This hides the close (×) button
        width={400}
        styles={{ padding: "0px" }}
      >
        <div className="min-h-[80vh] bg-gray-100 flex flex-col p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              shape="circle"
              icon={<LeftOutlined />}
              className="shadow"
              onClick={handleClose}
            />
            <Button
              hidden
              className="bg-green-200 rounded-xl px-4 py-1 font-semibold"
            >
              Book Appointment
            </Button>
          </div>

          {/* Address Section */}
          <Card
            className="rounded-xl shadow mb-3"
            bodyStyle={{ padding: "12px" }}
          >
            <div className="flex justify-between items-center">
              <Input
                value={address}
                disabled
                bordered={false}
                className="text-gray-700 font-medium"
              />
              <Button
                type="link"
                className="text-green-500 font-semibold p-0"
                onClick={handleEditClick}
              >
                EDIT
              </Button>
            </div>
          </Card>

          {/* Cart Item */}
          {cartItems.map((item, index) => (
            <div
              key={index}
              className="w-full bg-white rounded-2xl shadow-md p-4 flex flex-col transition hover:shadow-lg mt-4"
            >
              <div className="flex gap-4 justify-around">
                {/* Product Image */}
                <div className="w-28 h-28 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                  <img
                    src={
                      item?.product?.variants[0]?.images[0]?.url ||
                      "/glasses.png"
                    }
                    alt={item?.product.productName}
                    className="w-24 h-24 object-contain"
                  />
                </div>

                {/* Price, Color & Quantity */}
                <div className="flex flex-col justify-center">
                  {/* Price */}
                  <h3 className="text-xs font-semibold text-gray-700">
                    {item?.product.brand}
                  </h3>
                  <p className="text-gray-900 text-xs font-bold">
                    {item?.product.model}
                  </p>
                  <p className="text-green-700 text-xs font-bold">
                    ₱{item?.product.price}
                  </p>
                  <p className="text-xs text-gray-600">
                    Shop: {item?.product.company}
                  </p>
                  <p className="text-xs text-gray-600">
                    Stock: {item?.product.stocks}
                  </p>

                  {/* Color Swatch */}

                  <p className="text-xs text-gray-600">
                    Availed Color: {item?.color.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex justify-between items-start">
                {/* Title & Delete */}
                <Tooltip title="Remove item">
                  <Popconfirm
                    title="Remove Item"
                    description="Are you sure to remove this item?"
                    okText="Yes"
                    cancelText="No"
                    onConfirm={() => handleRemoveItem(item?._id)}
                  >
                    <button
                      className="flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-2.5 
               bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full 
               shadow-md transition-all duration-300 hover:shadow-lg active:scale-95 
               text-xs sm:text-sm md:text-base"
                    >
                      <DeleteOutlined className="text-md" />
                      REMOVE ITEM
                    </button>
                  </Popconfirm>
                </Tooltip>

                <div className="flex justify-between items-center mr-3">
                  <button
                    onClick={() => handleDecrement(index)}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-bold transition"
                  >
                    −
                  </button>
                  <span className="px-2 text-gray-800 font-medium text-sm">
                    {item.quantity || 1}
                  </span>
                  <button
                    onClick={() => handleIncrement(index)}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-bold transition"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Payment Method */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-600 text-sm mb-2 mt-4">
              PAYMENT METHOD
            </h4>
            <Card className="rounded-xl shadow" bodyStyle={{ padding: "12px" }}>
              <Radio.Group
                value={paymentMethod}
                onChange={handleRadioChange}
                className="flex flex-col w-full gap-2"
              >
                <Radio value="otc">Over the counter</Radio>
                <Radio value="cod">Cash on Delivery</Radio>
                <Radio value="card">Credit / Debit Card</Radio>
                {/* <Radio value="gcash">GCash</Radio>
                <Radio value="grabpay">GrabPay</Radio> */}
              </Radio.Group>
            </Card>
          </div>

          {paymentMethod === "card" && (
            <div className="mt-4 bg-white rounded-xl shadow-md p-4 border border-gray-200 mb-5">
              <h5 className="font-semibold text-gray-700 text-sm mb-3">
                Card Details
              </h5>

              {/* Card Number */}
              <div className="flex flex-col mb-3">
                <label className="text-[11px] font-medium text-gray-500 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm 
                   focus:ring-2 focus:ring-green-400 focus:outline-none transition w-full"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </div>

              {/* Expiry + CVC */}
              <div className="flex gap-3 flex-wrap md:flex-nowrap">
                <div className="flex flex-col flex-1 min-w-[60px]">
                  <label className="text-[11px] font-medium text-gray-500 mb-1">
                    MM
                  </label>
                  <input
                    type="text"
                    placeholder="MM"
                    className="border border-gray-300 rounded-md px-2 py-2 text-sm 
                     focus:ring-2 focus:ring-green-400 focus:outline-none text-center transition w-full"
                    value={expMonth}
                    onChange={(e) => setExpMonth(e.target.value)}
                  />
                </div>

                <div className="flex flex-col flex-1 min-w-[80px]">
                  <label className="text-[11px] font-medium text-gray-500 mb-1">
                    YYYY
                  </label>
                  <input
                    type="text"
                    placeholder="YYYY"
                    className="border border-gray-300 rounded-md px-2 py-2 text-sm 
                     focus:ring-2 focus:ring-green-400 focus:outline-none text-center transition w-full"
                    value={expYear}
                    onChange={(e) => setExpYear(e.target.value)}
                  />
                </div>

                <div className="flex flex-col flex-1 min-w-[60px]">
                  <label className="text-[11px] font-medium text-gray-500 mb-1">
                    CVC
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="border border-gray-300 rounded-md px-2 py-2 text-sm 
                     focus:ring-2 focus:ring-green-400 focus:outline-none text-center transition w-full"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                  />
                </div>
              </div>

              {/* Accepted Card Logos - always visible */}
              <div className="mt-6 w-full flex justify-center">
                <div className="flex justify-center gap-1 bg-gray-50 p-3 rounded-xl shadow-md flex-wrap md:flex-nowrap">
                  {acceptedCards.map((card) => (
                    <div
                      key={card.name}
                      className="flex flex-col items-center flex-1 min-w-[60px] sm:min-w-[80px] hover:scale-105 transition-transform duration-200"
                    >
                      <div className="text-3xl sm:text-4xl text-gray-700">
                        {card.icon}
                      </div>
                      <span className="text-[10px] sm:text-xs mt-1 font-semibold text-gray-700 text-center">
                        {card.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer Checkout */}
          <div className="mt-auto bg-green-200 p-4 flex justify-between items-center rounded-2xl shadow">
            <span className="font-semibold text-sm">
              Total: ₱{cartItems.length > 0 ? orderTotal : "0"}.00
            </span>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => handlePlaceOrder()}
                loading={loadingOrderButton}
                className="bg-green-400 text-white rounded-xl px-6 py-2 shadow"
              >
                ORDER
              </Button>
              <Popconfirm
                title="Remove All Item"
                description="Are you sure to remove all the item(s)?"
                okText="Yes"
                cancelText="No"
                onConfirm={() => handleRemoveAllItem(true)}
              >
                <Button
                  shape="circle"
                  icon={<DeleteOutlined />}
                  className="bg-green-300 shadow"
                />
              </Popconfirm>
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Address"
        open={isModalVisible}
        onOk={handleSave}
        loading={loading}
        onCancel={() => setIsModalVisible(false)}
        okText="Save"
        cancelText="Cancel"
      >
        <Input
          value={tempAddress}
          onChange={(e) => setTempAddress(e.target.value)}
        />
      </Modal>
    </div>
  );
}
