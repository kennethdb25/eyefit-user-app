import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../context/LoginContext";
import { Button, Input, Card, Radio, Modal, message, Tooltip } from "antd";
import {
  DeleteOutlined,
  LeftOutlined,
  ShoppingCartOutlined,
  ScheduleOutlined,
} from "@ant-design/icons";

export default function CartPage(props) {
  const { cartItems, setCartItems, cartData } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("otc"); // default value

  const { loginData, setLoginData } = useContext(LoginContext);
  const [address, setAddress] = useState(`${loginData?.body?.address}`);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tempAddress, setTempAddress] = useState(address);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const history = useNavigate();

  const showModal = () => setIsModalOpen(true);
  const handleClose = () => setIsModalOpen(false);

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
      await fetch(
        `https://eyefit-shop-800355ab3f46.herokuapp.com/api/user/checkout/${id}/quantity`,
        {
          // await fetch(`/api/user/checkout/${id}/quantity`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
        }
      );
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
    setTempAddress(address); // Load current address into modal
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    // setAddress(tempAddress);
    // setIsModalVisible(false);
    try {
      setLoading(true);
      const response = await fetch(
        `https://eyefit-shop-800355ab3f46.herokuapp.com/api/users/address/${loginData?.body?._id}`,
        // `/api/users/address/${loginData?.body?._id}`,
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
    const payload = {
      userId: cartItems[0]?.user?._id || null, // Get userId from the first object
      paymentMethod,
      products: cartItems.map((item) => ({
        productId: item.product._id,
        quantity: parseInt(item.quantity) || 1,
        color: item.color,
      })),
    };

    if (!payload || cartItems.length === 0) {
      return messageApi.info("No order in Cart");
    }

    const response = await fetch(
      "https://eyefit-shop-800355ab3f46.herokuapp.com/api/orders",
      {
        // const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
    const res = await response.json();

    if (res.success) {
      messageApi.success("Order Placed Successfully!");
      cartData();
      handleRemoveAllItem(false);
    } else {
      messageApi.error(res?.error || "Something went wrong");
    }
  };

  const handleRemoveItem = async (checkoutId) => {
    try {
      const data = await fetch(
        `https://eyefit-shop-800355ab3f46.herokuapp.com/api/user/remove/checkout?checkoutId=${checkoutId}`,
        // `/api/user/remove/checkout?checkoutId=${checkoutId}`,
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
      `https://eyefit-shop-800355ab3f46.herokuapp.com/api/user/remove/all/checkout?userId=${loginData?.body?._id}`,
      // `/api/user/remove/all/checkout?userId=${loginData?.body?._id}`,
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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {contextHolder}
      {/* Header */}
      <div className="bg-white p-4 flex items-center shadow">
        <button onClick={() => history("/home")} className="mr-3">
          &lt;
        </button>
        <h1 className="text-xl font-semibold">My Cart</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {cartItems.length === 0 ? (
          /* ---------- Empty State ---------- */
          <div className="flex flex-col items-center justify-center h-[70vh] text-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/102/102661.png"
              alt="Empty cart"
              className="w-32 h-32 mb-6 opacity-70"
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
              className="mt-6 bg-green-400 hover:bg-green-500 text-white px-6 py-2 rounded-xl shadow"
            >
              Shop Now
            </button>
          </div>
        ) : (
          /* ---------- Cart Items ---------- */
          <>
            {/* <div className="bg-white p-4 rounded-xl shadow-sm"> */}
            {/* <hr className="my-2" /> */}
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {cartItems.map((item, index) => (
                <div
                  key={index}
                  className="w-full bg-white rounded-2xl shadow-md p-4 flex flex-col transition hover:shadow-lg"
                >
                  <div className="flex gap-4 justify-around">
                    {/* Product Image */}
                    <img
                      src={item.productImgURL || "/glasses.png"}
                      alt={item.productName}
                      className="w-40 h-40 md:w-24 md:h-24 object-contain"
                    />

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
                  <div className="flex justify-around items-start">
                    {/* Title & Delete */}
                    <Tooltip title="Remove item">
                      <button
                        onClick={() => handleRemoveItem(item?._id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-2.5 
               bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full 
               shadow-md transition-all duration-300 hover:shadow-lg active:scale-95 
               text-xs sm:text-sm md:text-base"
                      >
                        <DeleteOutlined className="text-lg" />
                        REMOVE ITEM
                      </button>
                    </Tooltip>

                    <div className="flex justify-between items-center mr-5">
                      <button
                        onClick={() => handleDecrement(index)}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-lg font-bold transition"
                      >
                        −
                      </button>
                      <span className="px-3 text-gray-800 font-medium">
                        {item.quantity || 1}
                      </span>
                      <button
                        onClick={() => handleIncrement(index)}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-lg font-bold transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* </div> */}

            {/* Checkout + Trash */}
            <div className="flex justify-around items-center mt-4 mb-20">
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  handleCheckOut();
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-2.5 
               bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full 
               shadow-md transition-all duration-300 hover:shadow-lg active:scale-95 
               text-xs sm:text-sm md:text-base"
              >
                <ShoppingCartOutlined className="text-sm sm:text-base md:text-lg" />
                CHECK OUT
              </button>

              <button
                onClick={() => handleRemoveAllItem(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-2.5 
               bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full 
               shadow-md transition-all duration-300 hover:shadow-lg active:scale-95 
               text-xs sm:text-sm md:text-base"
              >
                <DeleteOutlined className="text-sm sm:text-base md:text-lg" />
                REMOVE ALL
              </button>
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
                <img
                  src={item.productImgURL || "/glasses.png"}
                  alt={item.productName}
                  className="w-28 h-28 md:w-20 md:h-20 object-contain"
                />

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
              <div className="flex justify-around items-start">
                {/* Title & Delete */}
                <Tooltip title="Remove item">
                  <button
                    onClick={() => handleRemoveItem(item?._id)}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2
      bg-red-600 hover:bg-red-700 text-white font-medium rounded-full 
      shadow-sm transition-all duration-300 hover:shadow-md active:scale-95 
      text-xs sm:text-sm"
                  >
                    <DeleteOutlined className="text-base" />
                    REMOVE
                  </button>
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
                className="flex flex-col w-full"
              >
                <Radio value="otc">Over the counter</Radio>
                <Radio value="cod">Cash on Delivery</Radio>
              </Radio.Group>
            </Card>
          </div>

          {/* Footer Checkout */}
          <div className="mt-auto bg-green-200 p-4 flex justify-between items-center rounded-2xl shadow">
            <span className="font-semibold text-sm">
              Total: ₱{cartItems.length > 0 ? orderTotal : "0"}.00
            </span>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => handlePlaceOrder()}
                className="bg-green-400 text-white rounded-xl px-6 py-2 shadow"
              >
                ORDER
              </Button>
              <Button
                onClick={() => handleRemoveAllItem(true)}
                shape="circle"
                icon={<DeleteOutlined />}
                className="bg-green-300 shadow"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Address"
        open={isModalVisible}
        onOk={handleSave}
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
