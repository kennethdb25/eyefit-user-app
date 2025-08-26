import { Carousel, Input, message } from "antd";
import {
  SearchOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { useContext, useEffect, useState } from "react";
import { LoginContext } from "../context/LoginContext";

export default function HomePage(props) {
  const [data, setData] = useState([]);
  const { loginData, setLoginData } = useContext(LoginContext);
  const [messageApi, contextHolder] = message.useMessage();
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
          slidesToShow={1}
          slidesToScroll={1}
          responsive={[
            {
              breakpoint: 768,
              settings: { slidesToShow: 2 },
            },
            {
              breakpoint: 1024,
              settings: { slidesToShow: 4 },
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
                <div className="flex gap-4">
                  <img
                    src={product.productImgURL || "/glasses.png"}
                    alt={product.productName}
                    className="w-20 h-20 md:w-24 md:h-24 object-contain"
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
                    onClick={() => onHandleAddToCart(product._id)}
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-20">
          {data
            .filter((item) => !item.featured)
            .map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-md p-4 flex flex-col transition hover:shadow-lg"
              >
                <div className="flex gap-3">
                  <img
                    src={product.productImgURL || "/glasses.png"}
                    alt={product.productName}
                    className="w-20 h-20 md:w-24 md:h-24 object-contain"
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
      </section>
    </div>
  );
}
