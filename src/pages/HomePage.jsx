import { Carousel, Input, message } from "antd";
import {
  SearchOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  StarFilled,
} from "@ant-design/icons";
import { useContext, useEffect, useState } from "react";
import { LoginContext } from "../context/LoginContext";

export default function HomePage(props) {
  const [data, setData] = useState([]);
  const { loginData, setLoginData } = useContext(LoginContext);
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { cartData } = props;

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/user/product`);
      const json = await res.json();
      setData(json.body || []); // assuming your API responds with { body: [...] }
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  const onHandleAddToCart = async (productId) => {
    const payload = {
      userId: loginData?.body._id,
      productId,
    };

    const response = await fetch("/api/user/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
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
        <div className="w-full max-w-lg px-4">
          <Input
            size="large"
            placeholder="Search...."
            prefix={<SearchOutlined style={{ fontSize: "18px" }} />}
            className="rounded-xl shadow-sm"
          />
        </div>
      </div>

      {/* Featured Products */}
      <section className="px-4 mt-6">
        <h2 className="text-lg md:text-2xl font-bold mb-4">
          🌟 Featured Products
        </h2>
        <Carousel
          dots={false}
          slidesToShow={1} // Default: always 1 slide first
          slidesToScroll={1}
          responsive={[
            {
              breakpoint: 1024, // Tablet & small laptops
              settings: {
                slidesToShow: 1,
              },
            },
            {
              breakpoint: 1280, // Larger screens
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
                className="bg-white rounded-2xl shadow-md p-4 flex flex-col m-2 transition hover:shadow-lg"
              >
                {/* Image + details */}
                <div
                  className="flex gap-4 justify-around"
                  onClick={() => setSelectedProduct(product)}
                >
                  <img
                    src={product.productImgURL || "/glasses.png"}
                    alt={product.productName}
                    className="w-40 h-40 md:w-24 md:h-24 object-contain"
                  />
                  <div className="flex flex-col justify-center">
                    <h3 className="text-xs font-semibold text-gray-700">
                      {product.brand}
                    </h3>
                    <p className="text-gray-900 text-xs font-bold">
                      {product.model}
                    </p>
                    <p className="text-green-700 text-xs font-bold">
                      ₱{product.price}
                    </p>
                    <p className="text-xs text-gray-600">
                      Shop: {product.company}
                    </p>
                    <p className="text-xs text-gray-600">
                      Stock: {product.stocks}
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2 mt-4">
                  <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm shadow">
                    Try
                  </button>
                  <button
                    onClick={() => setSelectedProduct(product)}
                    disabled={product?.stocks === 0}
                    className={`flex-1 py-2 rounded-lg shadow flex items-center justify-center text-sm ${
                      product?.stocks > 0
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-gray-400 text-white cursor-not-allowed"
                    }`}
                  >
                    <ShoppingCartOutlined />
                  </button>
                  <button className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-lg shadow flex items-center justify-center">
                    <HeartOutlined />
                  </button>
                </div>
              </div>
            ))}
        </Carousel>
      </section>

      {/* All Products */}
      <section className="px-4 mt-8">
        <h2 className="text-lg md:text-2xl font-bold mb-4">🛍️ All Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-20">
          {data
            .filter((item) => !item.featured)
            .map((product) => (
              <div
                key={product._id}
                className="w-full bg-white rounded-2xl shadow-md p-4 flex flex-col transition hover:shadow-lg"
              >
                {/* Product Image + Details */}
                <div
                  onClick={() => setSelectedProduct(product)}
                  className="flex gap-4 justify-around"
                >
                  <img
                    src={product.productImgURL || "/glasses.png"}
                    alt={product.productName}
                    className="w-40 h-40 md:w-24 md:h-24 object-contain"
                  />
                  <div className="flex flex-col justify-center">
                    <h3 className="text-xs font-semibold text-gray-700">
                      {product.brand}
                    </h3>
                    <p className="text-gray-900 text-xs font-bold">
                      {product.model}
                    </p>
                    <p className="text-green-700 text-xs font-bold">
                      ₱{product.price}
                    </p>
                    <p className="text-xs text-gray-600">
                      Shop: {product.company}
                    </p>
                    <p className="text-xs text-gray-600">
                      Stock: {product.stocks}
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2 mt-4">
                  <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm shadow">
                    Try
                  </button>
                  <button
                    onClick={() => setSelectedProduct(product)}
                    disabled={product?.stocks === 0}
                    className={`flex-1 py-2 rounded-lg shadow flex items-center justify-center text-sm ${
                      product?.stocks > 0
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-gray-400 text-white cursor-not-allowed"
                    }`}
                  >
                    <ShoppingCartOutlined />
                  </button>
                  <button className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-lg shadow flex items-center justify-center">
                    <HeartOutlined />
                  </button>
                </div>
              </div>
            ))}
        </div>

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
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={i < 4 ? "text-yellow-400" : "text-gray-300"}
                  >
                    ★
                  </span>
                ))}
                <span className="ml-2 text-sm text-gray-500">
                  (120 reviews)
                </span>
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
                          className="w-8 h-8 rounded-full border-2 border-gray-300"
                          style={{ backgroundColor: color }}
                        ></div>
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
                <ShoppingCartOutlined className="mr-2" /> Checkout
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
