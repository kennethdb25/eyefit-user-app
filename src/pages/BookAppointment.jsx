/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import { LoginContext } from "../context/LoginContext";
import {
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  Typography,
  message,
} from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function BookAppointment() {
  const { loginData } = useContext(LoginContext);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const history = useNavigate();
  const [storeData, setStoreData] = useState([]);
  const [bookedSlots, setBookedSlots] = useState({}); // now grouped by date
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [config, setConfig] = useState(null);

  const currentUser = {
    name: loginData?.body?.name,
    gender: loginData?.body?.gender,
    email: loginData?.body?.email,
    phone: loginData?.body?.contact.replace("+63", ""),
    address: loginData?.body?.address,
  };

  // Fetch business appointment config
  const fetchConfig = async (company) => {
    try {
      const res = await fetch(
        `https://eyefit-shop-800355ab3f46.herokuapp.com/api/appointment-config/${company}`
      );
      const data = await res.json();
      setConfig(data.success ? data.body : null);
    } catch (err) {
      console.error("Error fetching config:", err);
      setConfig(null);
    }
  };

  // Fetch all available businesses
  const fetchStoreData = async () => {
    try {
      const res = await fetch(
        `https://eyefit-shop-800355ab3f46.herokuapp.com/api/available/business`
      );
      const json = await res.json();
      setStoreData(json.body || []);
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  // Fetch all booked appointments grouped by date
  const fetchBookedSlots = async (company) => {
    if (!company) return;
    try {
      const data = await fetch(
        `https://eyefit-shop-800355ab3f46.herokuapp.com/api/validate/appointment?company=${company}`
      );
      const res = await data.json();

      // Group by date
      const bookedByDate = res.body?.reduce((acc, appointment) => {
        const date = appointment.date.split("T")[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(appointment.time);
        return acc;
      }, {});
      setBookedSlots(bookedByDate || {});
    } catch (error) {
      console.error(error);
      setBookedSlots({});
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, []);

  useEffect(() => {
    fetchBookedSlots(selectedCompany);
  }, [selectedCompany]);

  const generateTimeSlots = (start, end, interval = 30) => {
    const slots = [];
    let current = dayjs(start, "HH:mm");
    const endTime = dayjs(end, "HH:mm");
    while (current.isBefore(endTime) || current.isSame(endTime)) {
      slots.push(current.format("hh:mmA"));
      current = current.add(interval, "minute");
    }
    return slots;
  };

  const availableTime =
    selectedDate && config
      ? generateTimeSlots(
          config.workingHours.start,
          config.workingHours.end
        ).filter(
          (slot) =>
            !(bookedSlots[selectedDate.format("YYYY-MM-DD")] || []).includes(
              slot
            )
        )
      : [];

  const disableDates = (current) => {
    if (!config) return current.isBefore(dayjs(), "day");

    const isPast = current.isBefore(dayjs(), "day");
    const isUnavailable = config.exceptions?.includes(
      current.format("YYYY-MM-DD")
    );
    const isWorkingDay = config.workingDays.includes(current.day());

    return isPast || isUnavailable || !isWorkingDay;
  };

  const onFinish = async (values) => {
    if (!selectedDate || !selectedTime) {
      messageApi.error("Please enter description, date, and time");
      return;
    }

    values.date = selectedDate.format("YYYY-MM-DD");
    values.time = selectedTime;

    try {
      const response = await fetch(
        "https://eyefit-shop-800355ab3f46.herokuapp.com/api/appointments/add",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );
      const res = await response.json();
      if (res.success) {
        messageApi.success("Appointment Requested!");
        form.resetFields();
      } else {
        messageApi.error(res?.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      messageApi.error("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-4">
        {contextHolder}
        {/* Header */}
        <div className="flex items-center mb-4">
          <Button
            type="text"
            icon={<LeftOutlined />}
            onClick={() => history("/home")}
          />
          <Title level={4} className="m-0 mx-auto">
            Book Appointment
          </Title>
        </div>

        {/* Form */}
        <div className="pb-24">
          <Form
            layout="vertical"
            form={form}
            onFinish={onFinish}
            initialValues={{
              name: currentUser?.name,
              gender: currentUser?.gender,
              email: currentUser?.email,
              phone: currentUser?.phone,
              address: currentUser?.address,
            }}
            className="space-y-4"
          >
            {/* Store */}
            <Form.Item
              label="Store"
              name="store"
              rules={[{ required: true, message: "Please select a store" }]}
            >
              <Select
                placeholder="Select Store"
                onChange={(value) => {
                  setSelectedCompany(value);
                  fetchConfig(value);
                }}
              >
                {storeData.map(({ company }) => (
                  <Option key={company} value={company}>
                    {company}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Date */}
            <Form.Item
              label="Date"
              name="date"
              rules={[{ required: true, message: "Please select a date" }]}
            >
              <DatePicker
                format="YYYY-MM-DD"
                disabledDate={disableDates}
                onChange={(date) => setSelectedDate(date)}
                className="w-full"
                dateRender={(current) => {
                  const formatted = current.format("YYYY-MM-DD");

                  // RED for exceptions
                  if (config?.exceptions?.includes(formatted)) {
                    return (
                      <div
                        style={{
                          border: "1px solid red",
                          borderRadius: "50%",
                          color: "red",
                        }}
                      >
                        {current.date()}
                      </div>
                    );
                  }

                  const isWorkingDay = config?.workingDays?.includes(
                    current.day()
                  );
                  const isFuture = current.isSameOrAfter(dayjs(), "day");

                  if (isWorkingDay && isFuture) {
                    const bookedForDay = bookedSlots[formatted] || [];
                    const totalSlots = generateTimeSlots(
                      config.workingHours.start,
                      config.workingHours.end
                    );
                    const availableSlots = totalSlots.filter(
                      (slot) => !bookedForDay.includes(slot)
                    );

                    if (availableSlots.length > 0) {
                      return (
                        <div
                          style={{
                            border: "1px solid green",
                            borderRadius: "50%",
                            color: "green",
                          }}
                        >
                          {current.date()}
                        </div>
                      );
                    }
                  }

                  return current.date();
                }}
              />
            </Form.Item>

            {/* Time */}
            <Form.Item
              label="Select Time"
              name="time"
              hasFeedback
              rules={[{ required: true, message: "Please select a time!" }]}
            >
              <Select
                placeholder="Select Time"
                value={selectedTime}
                onChange={setSelectedTime}
                style={{ width: "100%", marginBottom: 20 }}
              >
                {availableTime.length > 0 ? (
                  availableTime.map((time) => (
                    <Option key={time}>{time}</Option>
                  ))
                ) : (
                  <Option disabled>No Available Time</Option>
                )}
              </Select>
            </Form.Item>

            {/* Personal Info */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="text-center font-semibold mb-3">
                Personal Information
              </h3>
              <Form.Item
                label="Full Name"
                name="name"
                rules={[
                  { required: true, message: "Please enter the full name" },
                  { max: 40, message: "Name can not exceed 40 characters" },
                ]}
              >
                <Input placeholder="Jane Smith" className="bg-green-100" />
              </Form.Item>
              <Form.Item
                label="Gender"
                name="gender"
                rules={[
                  { required: true, message: "Please select your gender" },
                ]}
              >
                <Select placeholder="Select Gender" className="bg-green-100">
                  <Option value="male" className="bg-green-100">
                    Male
                  </Option>
                  <Option value="female" className="bg-green-100">
                    Female
                  </Option>
                  <Option value="other" className="bg-green-100">
                    Other
                  </Option>
                </Select>
              </Form.Item>
              <Form.Item label="Email" name="email">
                <Input disabled className="bg-green-100" />
              </Form.Item>
              <Form.Item
                label="Mobile Number"
                name="phone"
                rules={[
                  { required: true, message: "Please enter your number" },
                  {
                    pattern: /^9\d{9}$/,
                    message:
                      "Mobile number must start with 9 and be 10 digits long",
                  },
                ]}
              >
                <Input
                  className="bg-green-100"
                  addonBefore="+63"
                  maxLength={10}
                  placeholder="9XXXXXXXXX"
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault(); // block non-numeric
                    }
                  }}
                />
              </Form.Item>
              <Form.Item
                label="Address"
                name="address"
                rules={[
                  { required: true, message: "Please add your address!" },
                ]}
              >
                <Input className="bg-green-100" />
              </Form.Item>
              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: "Please add description!" }]}
              >
                <TextArea rows={3} className="bg-green-100" />
              </Form.Item>
            </div>

            {/* Submit */}
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
    </div>
  );
}
