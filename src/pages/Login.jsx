// src/pages/Login.js
import { Form, Input, Button, Typography, Card } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ToastContainer, toast, Bounce } from "react-toastify";

const { Text } = Typography;

export default function Login(props) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const history = useNavigate();
  const { LoginValidation } = props;

  const handleSubmit = async (values) => {
    console.log("Login data:", values);
    setLoading(true);

    // TODO: send data to backend API
    setTimeout(() => setLoading(false), 1000); // mock delay
    // https://eyefit-shop-800355ab3f46.herokuapp.com
    const data = await fetch(
      "https://eyefit-shop-800355ab3f46.herokuapp.com/api/users/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      }
    );
    const res = await data.json();
    if (res.success) {
      LoginValidation();
      toast.success("Please wait...", {
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
      setTimeout(() => {
        let arry = res.result.userEmail.tokens;
        let lastElement = arry[arry.length - 1];
        localStorage.setItem("accountUserToken", lastElement.token);
        window.location.reload();
        setTimeout(() => {
          history("/home");
        }, 1000);
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
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 px-4">
      <ToastContainer />
      <Card className="w-full max-w-sm shadow-lg rounded-2xl">
        <div className="text-center mb-6">
          <img
            src="/icon.png"
            alt="icon_sidebar"
            style={{ width: "200px", height: "200px", margin: "0 auto" }}
          />
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Email */}
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Invalid email format" },
            ]}
          >
            <Input placeholder="Enter Email" />
          </Form.Item>

          {/* Password */}
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password placeholder="Enter Password" />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="bg-green-700 hover:bg-green-800"
            >
              Sign in
            </Button>
          </Form.Item>
        </Form>

        {/* Register Link */}
        <Text type="secondary" className="block text-center">
          Don’t have an account?{" "}
          <Link to="/register" className="text-green-700 font-semibold">
            Sign up
          </Link>
        </Text>
      </Card>
    </div>
  );
}
