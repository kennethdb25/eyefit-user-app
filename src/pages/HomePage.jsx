/* eslint-disable no-unused-vars */
import { Carousel, Input, message, Rate } from "antd";
import {
  SearchOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  LeftOutlined,
  RightOutlined,
  StarOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useContext, useEffect, useState, useRef } from "react";
import { LoginContext } from "../context/LoginContext";
import { useLocation, useNavigate } from "react-router-dom";

export default function HomePage(props) {
  const [data, setData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInput, setShowInput] = useState(false);
  const { loginData, setLoginData } = useContext(LoginContext);
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [initiateSearch, setInitiateSearch] = useState(false);
  const carouselRef = useRef(null);
  const containerRef = useRef(null);
  const history = useNavigate();
  const location = useLocation();
  const { cartData, cartItems } = props;

  const fetchData = async () => {
    try {
      const res = await fetch(
        `https://eyefit-shop-800355ab3f46.herokuapp.com/api/user/product`
      );
      const json = await res.json();
      console.log(json);
      setData(json.body || []); // assuming your API responds with { body: [...] }
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  const fetchRecommendedData = async () => {
    try {
      const res = await fetch(
        `https://eyefit-shop-800355ab3f46.herokuapp.com/api/user/recommended-product?q=${location.state?.faceShape}`
      );
      const json = await res.json();
      console.log(json);
      setData(json.body || []); // assuming your API responds with { body: [...] }
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      setInitiateSearch(true);
      const fetchSearchData = async () => {
        try {
          const res = await fetch(
            `https://eyefit-shop-800355ab3f46.herokuapp.com/api/product/search?q=${searchTerm}`
          );
          // const res = await fetch(`https://eyefit-shop-800355ab3f46.herokuapp.com/api/product/search?q=${searchTerm}`);
          const json = await res.json();
          setProducts(json.body || []); // assuming your API responds with { body: [...] }
        } catch (error) {
          console.error("Fetch failed:", error);
        }
      };
      fetchSearchData();
    } else {
      setInitiateSearch(false);
      // fetchData();
    }
  }, [searchTerm]);

  useEffect(() => {
    if (!location.state?.faceShape) fetchData();
    if (location.state?.faceShape) fetchRecommendedData();
    // eslint-disable-next-line
  }, [location.state?.faceShape]);

  const onHandLikeProduct = async (productId) => {
    const payload = {
      userId: loginData?.body?._id,
      productId,
    };

    const response = await fetch(
      "https://eyefit-shop-800355ab3f46.herokuapp.com/api/users/like",
      {
        // const response = await fetch("https://eyefit-shop-800355ab3f46.herokuapp.com/api/users/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
    const res = await response.json();

    if (res.success) {
      messageApi.success("Like <3!");
      cartData();
    } else {
      messageApi.error(res?.error || "Something went wrong");
    }
  };

  const onHandleRecentlyView = async (productId) => {
    const payload = {
      userId: loginData?.body?._id,
      productId,
    };

    const response = await fetch(
      "https://eyefit-shop-800355ab3f46.herokuapp.com/api/users/view",
      {
        // const response = await fetch("https://eyefit-shop-800355ab3f46.herokuapp.com/api/users/view", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
    const res = await response.json();

    if (res.success) {
      cartData();
    } else {
      messageApi.error(res?.error || "Something went wrong");
    }
  };

  const onHandleAddToCart = async (productId) => {
    const payload = {
      userId: loginData?.body?._id,
      productId,
      color: selectedColor,
    };

    if (selectedColor === null) {
      return messageApi.info("Please select a color!");
    }

    const response = await fetch(
      "https://eyefit-shop-800355ab3f46.herokuapp.com/api/user/checkout",
      {
        // const response = await fetch("https://eyefit-shop-800355ab3f46.herokuapp.com/api/user/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
    const res = await response.json();

    if (res.success) {
      messageApi.success("Item added successfully!");
      cartData();
    } else {
      messageApi.error(res?.error || "Something went wrong");
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowInput(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {contextHolder}

      {/* Logo + Search */}
      <div className="flex flex-col items-center py-6 bg-white shadow-sm">
        <img
          src="/icon.png"
          alt="EYEFIT logo"
          className="w-28 md:w-36 h-auto mb-4"
        />
        <div className="flex items-center justify-between w-full max-w-2xl gap-3 px-4">
          {/* Search Icon/Input */}
          <div ref={containerRef} className="flex-1">
            {!showInput ? (
              <button
                onClick={() => setShowInput(true)}
                className="p-2 rounded-full shadow hover:bg-gray-100 transition w-10 h-10 flex items-center justify-center"
              >
                <SearchOutlined style={{ fontSize: "20px" }} />
              </button>
            ) : (
              <Input
                size="large"
                placeholder="Search..."
                prefix={<SearchOutlined style={{ fontSize: "18px" }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-xl shadow-sm transition-all"
              />
            )}
          </div>
          {/* Book Appointment Button */}
          <button
            onClick={() => history("/cart")}
            className="relative bg-green-600 hover:bg-green-700 text-white text-sm md:text-base font-semibold py-2 px-4 rounded-lg shadow transition"
          >
            {/* Badge Count */}
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cartItems.length}
              </span>
            )}
            <ShoppingCartOutlined className="text-lg mr-1" />
            Cart Items
          </button>
        </div>
      </div>

      {/* Featured Products */}
      {!location.state?.faceShape && (
        <>
          {!initiateSearch ? (
            <>
              <section className="px-4 mt-6">
                <h2 className="text-lg md:text-2xl lg:text-3xl font-bold mb-4">
                  🌟 Featured Products
                </h2>
                <div className="relative">
                  {/* Left Arrow */}
                  {data.length > 0 ?? (
                    <button
                      onClick={() => carouselRef.current.prev()}
                      className="absolute top-1/2 -translate-y-1/2 left-2 z-10 p-2 rounded-full text-gray-700 bg-transparent hover:bg-black/10 transition"
                    >
                      <LeftOutlined />
                    </button>
                  )}
                  <Carousel
                    ref={carouselRef}
                    dots={false}
                    slidesToShow={4}
                    slidesToScroll={1}
                    responsive={[
                      {
                        breakpoint: 1024,
                        settings: {
                          slidesToShow: 1,
                        },
                      },
                      {
                        breakpoint: 1280,
                        settings: {
                          slidesToShow: 4,
                        },
                      },
                    ]}
                  >
                    {data
                      .filter((item) => item.featured)
                      .map((product) => (
                        <div
                          key={product._id}
                          className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center m-2 transition hover:shadow-lg"
                        >
                          {/* Image + details */}
                          <div
                            className="flex flex-col items-center text-center cursor-pointer"
                            onClick={() => {
                              setSelectedProduct(product);
                              onHandleRecentlyView(product?._id);
                            }}
                          >
                            {/* Bigger, centered image */}
                            <img
                              src={
                                product?.variants[0]?.images[0]?.url ||
                                "/glasses.png"
                              }
                              alt={product.productName}
                              className="w-48 h-48 md:w-56 md:h-56 object-contain mb-4"
                            />

                            {/* Bigger product details */}
                            <h3 className="text-sm md:text-base font-semibold text-gray-700">
                              {product.brand}
                            </h3>
                            <p className="text-gray-900 text-sm md:text-lg font-bold">
                              {product.model}
                            </p>
                            <p className="text-green-700 text-sm md:text-lg font-bold">
                              ₱{product.price}
                            </p>
                            <p className="text-gray-900 text-base md:text-lg font-bold">
                              Shop: {product.company}
                            </p>
                            <p className="text-sm md:text-base text-gray-600">
                              Stock: {product.stocks}
                            </p>
                          </div>

                          {/* Buttons */}
                          <div className="flex items-center gap-2 mt-4 w-full">
                            <button
                              onClick={() =>
                                history("/facescan", {
                                  state: { id: product?.arId },
                                })
                              }
                              className="flex-1 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-sm shadow"
                            >
                              Try
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                onHandleRecentlyView(product._id);
                              }}
                              disabled={product?.stocks === 0}
                              className={`flex-1 flex items-center justify-center py-3 rounded-lg shadow text-base ${
                                product?.stocks > 0
                                  ? "bg-green-600 hover:bg-green-700 text-white"
                                  : "bg-gray-600 text-white cursor-not-allowed"
                              }`}
                            >
                              <ShoppingCartOutlined className="text-xl" />
                            </button>
                            <button
                              onClick={() => onHandLikeProduct(product?._id)}
                              className="flex-1 flex items-center justify-center bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg shadow"
                            >
                              <HeartOutlined className="text-xl" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </Carousel>

                  {/* Right Arrow */}

                  {data.length > 0 ?? (
                    <button
                      onClick={() => carouselRef.current.next()}
                      className="absolute top-1/2 -translate-y-1/2 right-2 z-10 p-2 rounded-full text-gray-700 bg-transparent hover:bg-black/10 transition"
                    >
                      <RightOutlined />
                    </button>
                  )}
                </div>
              </section>

              {/* All Products */}
              <section className="px-4 mt-8">
                <h2 className="text-lg md:text-2xl font-bold mb-4">
                  🛍️ All Products
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-20">
                  {data.map((product) => (
                    <div
                      key={product._id}
                      className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center m-2 transition hover:shadow-lg"
                    >
                      {/* Image + details */}
                      <div
                        className="flex flex-col items-center text-center cursor-pointer"
                        onClick={() => {
                          setSelectedProduct(product);
                          onHandleRecentlyView(product._id);
                        }}
                      >
                        {/* Bigger, centered image */}
                        <img
                          src={
                            product?.variants[0]?.images[0]?.url ||
                            "/glasses.png"
                          }
                          alt={product.productName}
                          className="w-48 h-24 md:w-56 md:h-28 object-contain mb-4"
                        />

                        {/* Bigger product details */}
                        <h3 className="text-sm md:text-base font-semibold text-gray-700">
                          {product.brand}
                        </h3>
                        <p className="text-gray-900 text-sm md:text-lg font-bold">
                          {product.model}
                        </p>
                        <p className="text-green-700 text-sm md:text-lg font-bold">
                          ₱{product.price}
                        </p>
                        <p className="text-gray-900 text-base md:text-lg font-bold">
                          Shop: {product.company}
                        </p>
                        <p className="text-sm md:text-base text-gray-600">
                          Stock: {product.stocks}
                        </p>
                      </div>

                      {/* Buttons */}
                      <div className="flex items-center gap-2 mt-4 w-full">
                        <button
                          onClick={() =>
                            history("/facescan", {
                              state: { id: product?.arId },
                            })
                          }
                          className="flex-1 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-sm shadow"
                        >
                          Try
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            onHandleRecentlyView(product._id);
                          }}
                          disabled={product?.stocks === 0}
                          className={`flex-1 flex items-center justify-center py-3 rounded-lg shadow text-base ${
                            product?.stocks > 0
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-gray-600 text-white cursor-not-allowed"
                          }`}
                        >
                          <ShoppingCartOutlined className="text-xl" />
                        </button>
                        <button
                          onClick={() => onHandLikeProduct(product?._id)}
                          className="flex-1 flex items-center justify-center bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg shadow"
                        >
                          <HeartOutlined className="text-xl" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <>
              <section className="px-4 mt-6">
                <h2 className="text-lg md:text-2xl font-bold mb-4">
                  🛍️ Searched Products
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-20">
                  {products.map((product) => (
                    <div
                      key={product._id}
                      className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center m-2 transition hover:shadow-lg"
                    >
                      {/* Image + details */}
                      <div
                        className="flex flex-col items-center text-center cursor-pointer"
                        onClick={() => {
                          setSelectedProduct(product);
                          onHandleRecentlyView(product._id);
                        }}
                      >
                        {/* Bigger, centered image */}
                        <img
                          src={
                            product?.variants[0]?.images[0]?.url ||
                            "/glasses.png"
                          }
                          alt={product.productName}
                          className="w-48 h-48 md:w-56 md:h-56 object-contain mb-4"
                        />

                        {/* Bigger product details */}
                        <h3 className="text-sm md:text-base font-semibold text-gray-700">
                          {product.brand}
                        </h3>
                        <p className="text-gray-900 text-sm md:text-lg font-bold">
                          {product.model}
                        </p>
                        <p className="text-green-700 text-sm md:text-lg font-bold">
                          ₱{product.price}
                        </p>
                        <p className="text-gray-900 text-base md:text-lg font-bold">
                          Shop: {product.company}
                        </p>
                        <p className="text-sm md:text-base text-gray-600">
                          Stock: {product.stocks}
                        </p>
                      </div>

                      {/* Buttons */}
                      <div className="flex items-center gap-2 mt-4 w-full">
                        <button
                          onClick={() =>
                            history("/facescan", {
                              state: { id: product?.arId },
                            })
                          }
                          className="flex-1 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-sm shadow"
                        >
                          Try
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            onHandleRecentlyView(product._id);
                          }}
                          disabled={product?.stocks === 0}
                          className={`flex-1 flex items-center justify-center py-3 rounded-lg shadow text-base ${
                            product?.stocks > 0
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-gray-600 text-white cursor-not-allowed"
                          }`}
                        >
                          <ShoppingCartOutlined className="text-xl" />
                        </button>
                        <button
                          onClick={() => onHandLikeProduct(product?._id)}
                          className="flex-1 flex items-center justify-center bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg shadow"
                        >
                          <HeartOutlined className="text-xl" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </>
      )}

      {location.state?.faceShape && (
        <>
          <section className="px-4 mt-6">
            <h2 className="text-lg md:text-2xl lg:text-3xl font-bold mb-4 flex items-center gap-2">
              <StarOutlined className="text-yellow-500 text-2xl md:text-3xl" />
              Recommended Products
            </h2>

            {data.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-20">
                {data.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center m-2 transition hover:shadow-lg"
                  >
                    {/* Image + details */}
                    <div
                      className="flex flex-col items-center text-center cursor-pointer"
                      onClick={() => {
                        setSelectedProduct(product);
                        onHandleRecentlyView(product._id);
                      }}
                    >
                      {/* Bigger, centered image */}
                      <img
                        src={
                          product?.variants[0]?.images[0]?.url || "/glasses.png"
                        }
                        alt={product.productName}
                        className="w-48 h-24 md:w-56 md:h-28 object-contain mb-4"
                      />

                      {/* Bigger product details */}
                      <h3 className="text-sm md:text-base font-semibold text-gray-700">
                        {product.brand}
                      </h3>
                      <p className="text-gray-900 text-sm md:text-lg font-bold">
                        {product.model}
                      </p>
                      <p className="text-green-700 text-sm md:text-lg font-bold">
                        ₱{product.price}
                      </p>
                      <p className="text-gray-900 text-base md:text-lg font-bold">
                        Shop: {product.company}
                      </p>
                      <p className="text-sm md:text-base text-gray-600">
                        Stock: {product.stocks}
                      </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-2 mt-4 w-full">
                      <button
                        onClick={() =>
                          history("/facescan", {
                            state: { id: product?.arId },
                          })
                        }
                        className="flex-1 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-sm shadow"
                      >
                        Try
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          onHandleRecentlyView(product._id);
                        }}
                        disabled={product?.stocks === 0}
                        className={`flex-1 flex items-center justify-center py-3 rounded-lg shadow text-base ${
                          product?.stocks > 0
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-gray-600 text-white cursor-not-allowed"
                        }`}
                      >
                        <ShoppingCartOutlined className="text-xl" />
                      </button>
                      <button
                        onClick={() => onHandLikeProduct(product?._id)}
                        className="flex-1 flex items-center justify-center bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg shadow"
                      >
                        <HeartOutlined className="text-xl" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl shadow-inner">
                <InboxOutlined className="text-6xl text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800">
                  No Recommended Products
                </h3>
                <p className="text-gray-500 text-sm mt-2">
                  Please check back later — new products will appear soon!
                </p>
              </div>
            )}
          </section>
        </>
      )}

      {/* Modal */}
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
                    selectedProduct?.variants?.flatMap((v) => v.images) || [];

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
                    {selectedProduct.brand}
                  </h3>
                  <p className="text-lg text-gray-500">
                    {selectedProduct.model}
                  </p>
                </div>

                <p className="text-3xl font-bold text-green-600">
                  ₱{selectedProduct.price.toLocaleString()}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm">
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-700">Stocks:</span>{" "}
                    <span className="text-gray-800">
                      {selectedProduct.stocks}
                    </span>
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-700">Shop:</span>{" "}
                    {selectedProduct.company}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Rate
                    className="text-yellow-400 text-lg"
                    allowHalf
                    value={
                      selectedProduct?.averageRating
                        ? selectedProduct?.averageRating
                        : 0
                    }
                  />
                  <span className="text-sm text-gray-500">{`${selectedProduct.reviews.length} Reviews`}</span>
                </div>
              </div>

              {/* Colors */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Available Colors
                </p>
                <div className="flex gap-3">
                  {selectedProduct?.variants &&
                  selectedProduct?.variants.length > 0 ? (
                    <>
                      {selectedProduct.variants.map((variant) => (
                        <div
                          key={variant._id}
                          className={`w-8 h-8 rounded-full border-2 cursor-pointer ${
                            selectedColor === variant.color
                              ? "border-green-500 scale-110"
                              : "border-gray-300"
                          } transition-transform duration-200`}
                          style={{ backgroundColor: variant.color }}
                          onClick={() => setSelectedColor(variant.color)}
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
                onClick={() => onHandleAddToCart(selectedProduct._id)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold text-lg shadow-md"
              >
                <ShoppingCartOutlined className="mr-2" /> ADD TO CART
              </button>

              {/* Reviews Section */}
              {/* Reviews Section */}
              {selectedProduct?.reviews &&
                selectedProduct.reviews.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">
                      Customer Reviews
                    </h3>

                    <div className="space-y-4 max-h-60 overflow-y-auto pr-1 custom-scroll">
                      {selectedProduct.reviews.map((review, idx) => (
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
    </div>
  );
}
