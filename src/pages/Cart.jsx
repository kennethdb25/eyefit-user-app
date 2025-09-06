import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../context/LoginContext";
import { Button, Input, Card, Radio, Modal, message } from "antd";
import { DeleteOutlined, LeftOutlined } from "@ant-design/icons";

export default function CartPage(props) {
  const { cartItems, setCartItems, cartData } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("otc"); // default value

  const { loginData, setLoginData } = useContext(LoginContext);
  const [messageApi, contextHolder] = message.useMessage();
  const history = useNavigate();

  const showModal = () => setIsModalOpen(true);
  const handleClose = () => setIsModalOpen(false);

  // Increment
  const handleIncrement = (index) => {
    const updatedCart = [...cartItems];
    if (!updatedCart[index].quantity) updatedCart[index].quantity = 1;
    if (updatedCart[index].quantity < updatedCart[index].product.stocks) {
      updatedCart[index].quantity += 1;
    }
    setCartItems(updatedCart);
    checkTotal();
  };

  // Decrement
  const handleDecrement = (index) => {
    const updatedCart = [...cartItems];
    if (!updatedCart[index].quantity) updatedCart[index].quantity = 1;
    if (updatedCart[index].quantity > 1) {
      updatedCart[index].quantity -= 1;
    }
    setCartItems(updatedCart);
    checkTotal();
  };

  const handleRadioChange = (e) => {
    console.log("Selected value:", e.target.value);
    setPaymentMethod(e.target.value);
  };

  const handleCheckOut = () => {
    checkTotal();
    showModal();
  };

  const handlePlaceOrder = () => {
    const payload = {
      userId: cartItems[0]?.user?._id || null, // Get userId from the first object
      paymentMethod,
      products: cartItems.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
      })),
    };

    console.log(payload);
  };

  const handleRemoveItem = async (checkoutId) => {
    const data = await fetch(
      `https://eyefit-shop-800355ab3f46.herokuapp.com:5000/api/user/remove/checkout?checkoutId=${checkoutId}`,
      {
        method: "DELETE",
      }
    );

    const res = await data.json();

    checkTotal();
    if (res.success) {
      messageApi.success("Item removed successfully!");
      cartData();
    } else {
      messageApi.error(res?.error || "Something went wrong");
    }
  };

  const handleRemoveAllItem = async () => {
    const data = await fetch(
      `https://eyefit-shop-800355ab3f46.herokuapp.com:5000/api/user/remove/all/checkout?userId=${loginData?.body?._id}`,
      {
        method: "DELETE",
      }
    );

    const res = await data.json();

    if (res.success) {
      messageApi.success("All item(s) removed successfully!");
      cartData();
      checkTotal();
    } else {
      messageApi.error(res?.error || "Something went wrong");
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {contextHolder}
      {/* Header */}
      <div className="bg-white p-4 flex items-center shadow">
        <button onClick={() => history("/home")} className="mr-3">
          &lt;
        </button>
        <h1 className="text-xl font-semibold">My cart</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
            <button
              onClick={() => history("/appointment")}
              className="bg-green-300 px-6 py-2 rounded-2xl shadow text-black mb-4"
            >
              Book Appointment
            </button>
          </div>
        </div>
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
            {cartItems.map((item, index) => (
              <Card
                key={index}
                className="rounded-xl shadow mb-3"
                bodyStyle={{ padding: "12px" }}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item?.product?.productImgURL}
                    alt={item?.product?.productName}
                    className="w-20 h-20 object-contain"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-semibold text-sm">
                        {`${item?.product?.brand} - ${item?.product?.model}`}
                      </h3>
                      <Button
                        onClick={() => handleRemoveItem(item?._id)}
                        className="text-red-500 font-semibold p-0"
                        icon={<DeleteOutlined />}
                      ></Button>
                    </div>

                    <div className="flex justify-between">
                      <p className="text-gray-700 text-sm">
                        ₱{item?.product?.price}.00
                      </p>
                      <div className="flex items-center gap-2 mt-10">
                        <button
                          onClick={() => handleDecrement(index)}
                          className="px-2 py-1 bg-gray-200 rounded-lg text-lg font-bold"
                        >
                          −
                        </button>
                        <span className="px-3">{item.quantity || 1}</span>
                        <button
                          onClick={() => handleIncrement(index)}
                          className="px-2 py-1 bg-gray-200 rounded-lg text-lg font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {/* </div> */}

            {/* Checkout + Trash */}
            <div className="flex justify-between items-center mt-4 mb-20">
              <button
                onClick={() => handleCheckOut()}
                className="bg-green-300 px-6 py-2 rounded-2xl shadow text-black"
              >
                CHECK OUT
              </button>
              <button
                onClick={() => handleRemoveAllItem()}
                className="bg-green-300 p-2 rounded-2xl shadow"
              >
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
                placeholder="Address..."
                bordered={false}
                className="text-gray-500"
              />
              <Button type="link" className="text-green-500 font-semibold p-0">
                EDIT
              </Button>
            </div>
          </Card>

          {/* Cart Item */}
          {cartItems.map((item, index) => (
            <Card
              className="rounded-xl shadow mb-3"
              bodyStyle={{ padding: "12px" }}
            >
              <div className="flex items-center gap-3">
                <img
                  src={item?.product?.productImgURL}
                  alt={item?.product?.productName}
                  className="w-20 h-20 object-contain"
                />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-semibold text-sm">
                      {`${item?.product?.brand} - ${item?.product?.model}`}
                    </h3>
                    <Button
                      onClick={() => handleRemoveItem(item?._id)}
                      className="text-red-500 font-semibold p-0"
                      icon={<DeleteOutlined />}
                    ></Button>
                  </div>

                  <div className="flex justify-between">
                    <p className="text-gray-700 text-sm">
                      ₱{item?.product?.price}.00
                    </p>
                    <div className="flex items-center gap-2 mt-10">
                      <button
                        onClick={() => handleDecrement(index)}
                        className="px-2 py-1 bg-gray-200 rounded-lg text-lg font-bold"
                      >
                        −
                      </button>
                      <span className="px-3">{item.quantity || 1}</span>
                      <button
                        onClick={() => handleIncrement(index)}
                        className="px-2 py-1 bg-gray-200 rounded-lg text-lg font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Payment Method */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-600 text-sm mb-2">
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
                onClick={() => handleRemoveAllItem()}
                shape="circle"
                icon={<DeleteOutlined />}
                className="bg-green-300 shadow"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
