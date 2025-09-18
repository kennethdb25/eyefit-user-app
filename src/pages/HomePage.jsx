/* eslint-disable no-unused-vars */
import { Carousel, Input, message, Rate } from "antd";
import {
  SearchOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  LeftOutlined,
  RightOutlined,
  ScheduleOutlined,
} from "@ant-design/icons";
import { useContext, useEffect, useState, useRef } from "react";
import { LoginContext } from "../context/LoginContext";
import { useNavigate } from "react-router-dom";

export default function HomePage(props) {
  const [data, setData] = useState([]);
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
  const { cartData } = props;

  const fetchData = async () => {
    try {
      const res = await fetch(
        `https://eyefit-shop-800355ab3f46.herokuapp.com/api/user/product`
      );
      // const res = await fetch(`/api/user/product`);
      const json = await res.json();
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
          // const res = await fetch(`/api/product/search?q=${searchTerm}`);
          const json = await res.json();
          setProducts(json.body || []); // assuming your API responds with { body: [...] }
        } catch (error) {
          console.error("Fetch failed:", error);
        }
      };
      fetchSearchData();
    } else {
      setInitiateSearch(false);
      fetchData();
    }
  }, [searchTerm]);

  const onHandLikeProduct = async (productId) => {
    const payload = {
      userId: loginData?.body?._id,
      productId,
    };

    const response = await fetch(
      "https://eyefit-shop-800355ab3f46.herokuapp.com/api/users/like",
      {
        // const response = await fetch("/api/users/like", {
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
        // const response = await fetch("/api/users/view", {
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
        // const response = await fetch("/api/user/checkout", {
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
    fetchData();

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
          {/* Book Appointment Button */}
          <button
            onClick={() => history("/appointment")}
            className="bg-green-600 hover:bg-green-700 text-white text-sm md:text-base font-semibold py-2 px-4 rounded-lg shadow transition"
          >
            <ScheduleOutlined className="text-lg mr-1" />
            SET AN APPOINTMENT
          </button>

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
        </div>
      </div>

      {/* Featured Products */}
      {!initiateSearch ? (
        <>
          <section className="px-4 mt-6">
            <h2 className="text-lg md:text-2xl lg:text-3xl font-bold mb-4">
              🌟 Featured Products
            </h2>
            <div className="relative">
              {/* Left Arrow */}
              <button
                onClick={() => carouselRef.current.prev()}
                className="absolute top-1/2 -translate-y-1/2 left-2 z-10 p-2 rounded-full text-gray-700 bg-transparent hover:bg-black/10 transition"
              >
                <LeftOutlined />
              </button>

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
                          onHandleRecentlyView(product._id);
                        }}
                      >
                        {/* Bigger, centered image */}
                        <img
                          src={product.productImgURL || "/glasses.png"}
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
                        <button className="flex-1 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-base shadow">
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
              <button
                onClick={() => carouselRef.current.next()}
                className="absolute top-1/2 -translate-y-1/2 right-2 z-10 p-2 rounded-full text-gray-700 bg-transparent hover:bg-black/10 transition"
              >
                <RightOutlined />
              </button>
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
                      src={product.productImgURL || "/glasses.png"}
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
                    <button className="flex-1 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-sm shadow">
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
                      src={product.productImgURL || "/glasses.png"}
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
                    <button className="flex-1 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-base shadow">
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

      {/* Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white rounded-3xl w-11/12 max-w-md mx-auto p-6 relative animate-slide-up-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black text-xl"
            >
              ✕
            </button>

            {/* Product Image */}
            <div className="flex justify-center mb-4">
              <div className="bg-gray-100 rounded-2xl p-4 shadow-inner">
                <img
                  src={selectedProduct.productImgURL || "/glasses.png"}
                  alt={selectedProduct.productName}
                  className="w-40 h-40 object-contain"
                />
              </div>
            </div>

            {/* Product Details */}
            <h3 className="text-xl font-bold text-gray-800">
              {selectedProduct.brand}
            </h3>
            <p className="text-gray-500 mb-2">{selectedProduct.model}</p>
            <p className="text-green-600 font-bold text-2xl mb-4">
              ₱{selectedProduct.price}
            </p>

            <div className="flex flex-row">
              <p className="text-gray-500 mb-2">Stocks: </p>
              <p className="text-gray-700">{selectedProduct.stocks}</p>
            </div>

            <p className="text-sm text-gray-600">
              Shop: {selectedProduct.company}
            </p>

            {/* Star Reviews */}

            {/* className={i < 4 ? "text-yellow-400" : "text-gray-300"} */}
            <div className="flex items-center mb-4">
              <Rate
                className="text-yellow-400"
                allowHalf
                value={selectedProduct?.rating ? selectedProduct?.rating : 0}
              />
              <span className="ml-2 text-sm text-gray-500">(120 reviews)</span>
            </div>

            {/* Colors */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Available Colors
              </p>
              <div className="flex gap-3">
                {selectedProduct?.colors &&
                selectedProduct?.colors.length > 0 ? (
                  <>
                    {selectedProduct?.colors?.map((color) => (
                      <div
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 cursor-pointer ${
                          selectedColor === color
                            ? "border-green-500 scale-110"
                            : "border-gray-300"
                        } transition-transform duration-200`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                      />
                    ))}
                  </>
                ) : (
                  <>
                    <p className="text xs text-gray-500 mb-2">
                      No Available Color
                    </p>
                  </>
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
          </div>
        </div>
      )}
    </div>
  );
}
