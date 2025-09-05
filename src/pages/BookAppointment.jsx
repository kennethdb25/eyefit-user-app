import React from "react";
import { Form, Input, Button, DatePicker, Select, Typography } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function BookAppointment() {
  const [form] = Form.useForm();
  const history = useNavigate();

  const onFinish = (values) => {
    console.log("Form Values:", values);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-4">
        {/* Header */}
        <div className="flex items-center mb-4">
          <Button
            type="text"
            icon={<LeftOutlined />}
            onClick={() => history("/cart")}
          />
          <Title level={4} className="m-0 mx-auto">
            Book Appointment
          </Title>
        </div>

        {/* Form */}
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
          className="space-y-4"
        >
          {/* Store */}
          <Form.Item
            label="Store"
            name="store"
            rules={[{ required: true, message: "Please select a store" }]}
          >
            <Select placeholder="Select Store">
              <Option value="store1">Store 1</Option>
              <Option value="store2">Store 2</Option>
            </Select>
          </Form.Item>

          {/* Address */}
          <Form.Item
            label="Address"
            name="storeAddress"
            rules={[{ required: true, message: "Please enter address" }]}
          >
            <Input placeholder="Enter store address" />
          </Form.Item>

          {/* Date */}
          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: "Please select a date" }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          {/* Personal Information Section */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h3 className="text-center font-semibold mb-3">
              Personal Information
            </h3>

            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Please enter your name" }]}
            >
              <Input placeholder="Your name" className="bg-green-100" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { type: "email", required: true, message: "Invalid email" },
              ]}
            >
              <Input placeholder="Your email" className="bg-green-100" />
            </Form.Item>

            <Form.Item
              label="Phone"
              name="phone"
              rules={[{ required: true, message: "Please enter your phone" }]}
            >
              <Input placeholder="Your phone number" className="bg-green-100" />
            </Form.Item>

            <Form.Item
              label="Address"
              name="address"
              rules={[{ required: true, message: "Please enter your address" }]}
            >
              <Input placeholder="Your address" className="bg-green-100" />
            </Form.Item>

            <Form.Item label="Description" name="description">
              <TextArea
                rows={3}
                placeholder="Add description"
                className="bg-green-100"
              />
            </Form.Item>
          </div>

          {/* Submit Button */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-green-500 hover:bg-green-600 border-none rounded-full"
            >
              Done
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
