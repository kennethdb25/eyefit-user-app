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
  Rate,
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

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const history = useNavigate();

  const onHandleOpenModal = (item) => {
    setSelectedProduct(item);
  };

  const onHandleUpdateToCart = async (product) => {
    if (!selectedColor) {
      messageApi.warning("Please select a color.");
      return;
    }
    try {
      const response = await fetch(
        `https://eyefit-shop-800355ab3f46.herokuapp.com/api/user/update/checkout/${product}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ color: selectedColor }),
        }
      );

      console.log(response);

      if (response.ok) {
        setSelectedProduct(null);
        setSelectedColor(null);
        cartData();
        messageApi.success(`Product color updated successfully`);
      }
    } catch (error) {
      console.log(error);
    }
    console.log(product);
  };

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

  const updateQuantityAPI = async (id, quantity) => {
    try {
      await fetch(
        `https://eyefit-shop-800355ab3f46.herokuapp.com/api/user/checkout/${id}/quantity`,
        {
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

  const handleRadioChange = (e) => {
    const selected = e.target.value;
    console.log("Selected value:", selected);
    setPaymentMethod(selected);
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
        `https://eyefit-shop-800355ab3f46.herokuapp.com/api/users/address/${loginData?.body?._id}`,
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
    let previousCompany = null;

    for (const item of cartItems) {
      if (!previousCompany) {
        previousCompany = item?.product?.company;
      } else if (
        item?.product?.company.toString() !== previousCompany.toString()
      ) {
        return messageApi.error(
          "Unauthorized Transaction. Items must be from the same company"
        );
      }
    }
    let intentData;
    if (paymentMethod === "card") {
      try {
        // 1. Create Payment Intent (backend)
        const intentRes = await fetch(
          "https://eyefit-shop-800355ab3f46.herokuapp.com/api/user/create-payment-intent",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: orderTotal * 100 }), // convert pesos → centavos
          }
        );
        intentData = await intentRes.json();
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
        createOrder(intentData);
      } catch (err) {
        console.error(err);
        alert("Payment failed");
      }
    } else if (paymentMethod === "gcash" || paymentMethod === "grabpay") {
      try {
        handleRemoveAllItem(false);

        createOrder(intentData);
        const sourceRes = await fetch("https://api.paymongo.com/v1/sources", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa("sk_test_WP1FKzGNZwVitiwi53116N7X"),
          },
          body: JSON.stringify({
            data: {
              attributes: {
                amount: orderTotal * 100,
                currency: "PHP",
                type: paymentMethod,
                redirect: {
                  success: `${window.location.origin}/payment-success`,
                  failed: `${window.location.origin}/payment-failed`,
                },
              },
            },
          }),
        });

        const sourceData = await sourceRes.json();
        console.log(sourceData);
        const checkoutUrl =
          sourceData?.data?.attributes?.redirect?.checkout_url;

        if (checkoutUrl) {
          window.location.href = checkoutUrl; // redirect to e-wallet page
          return;
        } else {
          messageApi.error("Failed to create e-wallet source");
        }
      } catch (error) {
        console.error(error);
        messageApi.error("E-Wallet payment failed");
      }
    } else {
      createOrder(intentData);
    }
  };

  const createOrder = async (intentData) => {
    try {
      const payload = {
        userId: loginData?.body?._id || null, // Get userId from the first object
        paymentMethod,
        paymentDetails:
          paymentMethod === "card" ? intentData?.body?.data || "" : "",
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
      const response = await fetch(
        "https://eyefit-shop-800355ab3f46.herokuapp.com/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      const res = await response.json();

      if (res.success) {
        handleRemoveAllItem(false);
        messageApi.success("Order Placed Successfully!");
        cartData();
        setPaymentMethod("otc");

        setIsModalOpen(false);
      } else {
        messageApi.error(res?.error || res.message || "Something went wrong");
      }
    } finally {
      setLoadingOrderButton(false);
    }
  };

  const handleRemoveItem = async (checkoutId) => {
    try {
      const data = await fetch(
        `https://eyefit-shop-800355ab3f46.herokuapp.com/api/user/remove/checkout?checkoutId=${checkoutId}`,
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
                  className="relative w-full bg-white rounded-2xl shadow-sm hover:shadow-md 
             transition-all duration-300 p-4 flex flex-col"
                >
                  {/* 🟩 Edit Button (Top-Right Corner) */}
                  <button
                    onClick={() => onHandleOpenModal(item)}
                    className="absolute top-3 right-3 text-blue-600 hover:text-blue-800 
               text-sm font-semibold transition"
                  >
                    Edit
                  </button>

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
                        <div className="text-xs text-gray-500">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>Color:</span>
                            <div
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: item?.color }}
                            ></div>
                          </div>
                        </div>
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

      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white rounded-3xl w-11/12 max-w-md mx-auto relative animate-slide-up-center shadow-xl
                       max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Scrollable Content */}
            <div className="overflow-y-auto px-6 pb-20 pt-6 custom-scroll">
              {/* Close Button */}
              <button
                onClick={() => setSelectedProduct(null)}
                className="sticky top-0 ml-auto text-gray-400 hover:text-black text-xl bg-white rounded-full p-1 z-10"
              >
                ✕
              </button>

              {/* Carousel Section */}
              <div className="relative flex justify-center mb-4">
                {(() => {
                  const allImages =
                    selectedProduct?.product?.variants?.flatMap(
                      (v) => v.images
                    ) || [];

                  const prevImage = () =>
                    setCurrentIndex((prev) =>
                      prev === 0 ? allImages.length - 1 : prev - 1
                    );
                  const nextImage = () =>
                    setCurrentIndex((prev) =>
                      prev === allImages.length - 1 ? 0 : prev + 1
                    );

                  return (
                    <div className="relative bg-gray-100 rounded-2xl p-4 shadow-inner w-60 h-60 flex items-center justify-center">
                      {allImages.length > 0 ? (
                        <img
                          src={allImages[currentIndex].url}
                          alt={`Product ${currentIndex}`}
                          className="w-40 h-40 object-contain"
                        />
                      ) : (
                        <img
                          src={selectedProduct.productImgURL || "/glasses.png"}
                          alt={selectedProduct.productName}
                          className="w-40 h-40 object-contain"
                        />
                      )}

                      {/* Left Arrow */}
                      {allImages.length > 1 && (
                        <button
                          onClick={prevImage}
                          className="absolute -left-12 top-1/2 transform -translate-y-1/2 bg-transparent p-2 rounded-full hover:bg-black/10"
                        >
                          ◀
                        </button>
                      )}

                      {/* Right Arrow */}
                      {allImages.length > 1 && (
                        <button
                          onClick={nextImage}
                          className="absolute -right-12 top-1/2 transform -translate-y-1/2 bg-transparent p-2 rounded-full hover:bg-black/10"
                        >
                          ▶
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Product Info */}
              <div className="space-y-3 border-t border-b border-gray-200 py-4">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    {selectedProduct?.product?.brand}
                  </h3>
                  <p className="text-lg text-gray-500">
                    {selectedProduct?.product?.model}
                  </p>
                </div>

                <p className="text-3xl font-bold text-green-600">
                  ₱{selectedProduct?.product?.price.toLocaleString()}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm">
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-700">Stocks:</span>{" "}
                    <span className="text-gray-800">
                      {selectedProduct?.product?.stocks}
                    </span>
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-700">Shop:</span>{" "}
                    {selectedProduct?.product?.company}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Rate
                    className="text-yellow-400 text-lg"
                    allowHalf
                    value={
                      selectedProduct?.product?.averageRating
                        ? selectedProduct?.product?.averageRating
                        : 0
                    }
                  />
                  <span className="text-sm text-gray-500">{`${
                    selectedProduct && selectedProduct?.product?.reviews
                      ? selectedProduct?.product?.reviews.length
                      : 0
                  } Reviews`}</span>
                </div>
              </div>

              {/* Colors */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Available Colors
                </p>
                <div className="flex gap-3">
                  {selectedProduct?.product?.variants &&
                  selectedProduct?.product?.variants.length > 0 ? (
                    <>
                      {selectedProduct?.product?.variants.map((variant) => (
                        <div
                          key={variant._id}
                          className={`w-8 h-8 rounded-full border-2 cursor-pointer ${
                            selectedColor === variant?.product?.color
                              ? "border-green-500 scale-110"
                              : "border-gray-300"
                          } transition-transform duration-200`}
                          style={{ backgroundColor: variant.color }}
                          onClick={() => setSelectedColor(variant?.color)}
                        />
                      ))}
                    </>
                  ) : (
                    <p className="text-xs text-gray-500 mb-2">
                      No Available Color
                    </p>
                  )}
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => onHandleUpdateToCart(selectedProduct._id)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold text-lg shadow-md"
              >
                <ShoppingCartOutlined className="mr-2" /> UPDATE TO CART
              </button>

              {/* Reviews Section */}
              {selectedProduct?.product?.reviews &&
                selectedProduct?.product.reviews.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">
                      Customer Reviews
                    </h3>

                    <div className="space-y-4 max-h-60 overflow-y-auto pr-1 custom-scroll">
                      {selectedProduct?.product.reviews.map((review, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm"
                        >
                          {/* Reviewer Info */}
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                              {review?.user?.name?.charAt(0) || "U"}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {review?.user?.name || "Anonymous"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(
                                  review.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {/* Rating */}
                          <div className="flex items-center gap-2 mb-2">
                            <Rate disabled defaultValue={review.rating} />
                            <span className="text-sm font-medium text-gray-700">
                              {review.rating} / 5
                            </span>
                          </div>

                          {/* Comment */}
                          <div className="bg-white rounded-lg border border-gray-100 p-3 shadow-inner">
                            <p className="text-gray-700 text-sm italic leading-relaxed">
                              “{review.comment}”
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

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
          {cartItems && cartItems.length > 0 ? (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-600 text-sm mb-2 mt-4">
                PAYMENT METHOD
              </h4>
              <Card
                className="rounded-xl shadow"
                bodyStyle={{ padding: "12px" }}
              >
                <Radio.Group
                  value={paymentMethod}
                  onChange={handleRadioChange}
                  className="flex flex-col w-full gap-2"
                >
                  <Radio value="otc">Over the counter</Radio>
                  <Radio value="cod">Cash on Delivery</Radio>
                  <Radio value="card">Credit / Debit Card</Radio>
                  <Radio value="gcash">GCash</Radio>
                </Radio.Group>
              </Card>
            </div>
          ) : null}

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
