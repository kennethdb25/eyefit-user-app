// src/pages/Login.js
import { Form, Input, Button, Typography, Card } from "antd";
import { Link } from "react-router-dom";
import { useState } from "react";

const { Title, Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (values) => {
    console.log("Login data:", values);
    setLoading(true);

    // TODO: send data to backend API
    setTimeout(() => setLoading(false), 1000); // mock delay
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-sm shadow-lg rounded-2xl">
        <Title level={2} className="text-center mb-6">
          EYEFIT
        </Title>

        <Form layout="vertical" onFinish={handleSubmit}>
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
