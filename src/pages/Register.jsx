// src/pages/Register.js
import { Form, Input, Button, Typography, Card, Select, message } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;
const { Option } = Select;

export default function Register() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const history = useNavigate();

  const handleSubmit = async (values) => {
    if (values.password !== values.confirmPassword) {
      return alert("Passwords do not match!");
    }
    setLoading(true);

    const response = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });
    const res = await response.json();

    console.log("Response JSON:", res);

    if (res.success) {
      messageApi.success("Account Created Successfully! Go to Login Page");
      form.resetFields();
      setTimeout(() => {
        window.location.reload();
        history("/");
      }, 1000);
    } else {
      messageApi.error(res?.error || "Something went wrong");
    }

    setTimeout(() => setLoading(false), 1000); // mock loading
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      {contextHolder}
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <div className="text-center mb-6">
          <img
            src="/icon.png"
            alt="icon_sidebar"
            style={{ width: "200px", height: "200px", margin: "0 auto" }}
          />
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Full Name */}
          <Form.Item
            label="Full Name"
            name="name"
            rules={[
              { required: true, message: "Please enter the full name" },
              { max: 40, message: "Name can not exceed 40 characters" },
            ]}
          >
            <Input placeholder="Jane Smith" />
          </Form.Item>

          {/* Email */}
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter the email" },
              { max: 40, message: "Model can not exceed 40 characters" },
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

          <Form.Item
            label="Gender"
            name="gender"
            rules={[{ required: true, message: "Please select your gender" }]}
          >
            <Select placeholder="Select Gender">
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          {/* Password */}
          <Form.Item
            label="Password"
            name="password"
            labelCol={{
              span: 24,
            }}
            wrapperCol={{
              span: 24,
            }}
            hasFeedback
            rules={[
              {
                required: true,
                message: "Please input your password!",
              },
              { whitespace: true },
              {
                min: 8,
                message: "Password must be at least 8 characters",
              },
              {
                max: 26,
                message: "Password cannot be longer than 26 characters",
              },
              {
                pattern:
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,26}$/,
                message:
                  "Must contain 1 uppercase, 1 lowercase, 1 number, and 1 special character.",
              },
            ]}
          >
            <Input.Password placeholder="********" />
          </Form.Item>

          {/* Confirm Password */}
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            labelCol={{
              span: 24,
              //offset: 2
            }}
            wrapperCol={{
              span: 24,
              //offset: 2
            }}
            hasFeedback
            dependencies={["password"]}
            rules={[
              {
                required: true,
                message: "Confirm Password is required!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }

                  return Promise.reject("Passwords does not matched.");
                },
              }),
            ]}
          >
            <Input.Password placeholder="********" />
          </Form.Item>

          {/* Submit */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="bg-green-700 hover:bg-green-800"
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
