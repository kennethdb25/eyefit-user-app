// src/pages/Register.js
import { Form, Input, Button, Typography, Card } from "antd";
import { useState } from "react";

const { Title, Text } = Typography;

export default function Register() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (values) => {
    if (values.password !== values.confirmPassword) {
      return alert("Passwords do not match!");
    }
    setLoading(true);

    console.log("Register data:", values);
    // TODO: send values to backend API

    setTimeout(() => setLoading(false), 1000); // mock loading
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <Title level={2} className="text-center mb-6">
          Create Account
        </Title>

        <Form layout="vertical" onFinish={handleSubmit}>
          {/* Full Name */}
          <Form.Item
            label="Full Name"
            name="name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input placeholder="Jane Smith" />
          </Form.Item>

          {/* Email */}
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Invalid email format" },
            ]}
          >
            <Input placeholder="jane@example.com" />
          </Form.Item>

          {/* Address */}
          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: true, message: "Please enter your address" }]}
          >
            <Input placeholder="123 Main Street" />
          </Form.Item>

          {/* Contact */}
          <Form.Item
            label="Mobile Number"
            name="contact"
            rules={[{ required: true, message: "Please enter your number" }]}
          >
            <Input placeholder="+63**********" />
          </Form.Item>

          {/* Password */}
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>

          {/* Confirm Password */}
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match!"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>

          {/* Submit */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="rounded-lg"
            >
              Register
            </Button>
          </Form.Item>
        </Form>

        {/* Link to Login */}
        <Text type="secondary" className="block text-center">
          Already have an account?{" "}
          <a href="/" className="text-blue-600 hover:underline">
            Login
          </a>
        </Text>
      </Card>
    </div>
  );
}
