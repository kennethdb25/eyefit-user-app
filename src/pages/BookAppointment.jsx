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
  const { loginData, setLoginData } = useContext(LoginContext);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const history = useNavigate();
  const [storeData, setStoreData] = useState([]);
  const [fullyBookedDates, setFullyBookedDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  // const [listOfBookedDate, setListOfBookedDate] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState();

  const currentUser = {
    name: loginData?.body?.name,
    gender: loginData?.body?.gender,
    email: loginData?.body?.email,
    phone: loginData?.body?.contact,
    address: loginData?.body?.address,
  };

  const fetchStoreData = async () => {
    try {
      const res = await fetch(
        `https://eyefit-shop-800355ab3f46.herokuapp.com/api/available/business`
      );
      // const res = await fetch(`/api/available/business`);
      const json = await res.json();
      setStoreData(json.body || []); // assuming your API responds with { body: [...] }
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  const onFinish = async (values) => {
    if (selectedDate === null && !selectedTime) {
      messageApi.error("Please enter description, date and time");
      return;
    }
    const formattedDate = selectedDate.format("YYYY-MM-DD");
    const formattedTime = selectedTime;
    values.date = formattedDate;
    values.time = formattedTime;

    const response = await fetch(
      "https://eyefit-shop-800355ab3f46.herokuapp.com/api/appointments/add",
      {
        // const response = await fetch("/api/appointments/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
  };

  //disableDays
  const disableDates = (current) => {
    return (
      current.isBefore(dayjs(), "day") ||
      current.day() === 0 ||
      current.day() === 6 ||
      fullyBookedDates.includes(current.format("YYYY-MM-DD"))
    );
  };

  const availableTime = [
    "08:30AM",
    "09:00AM",
    "09:30AM",
    "10:00AM",
    "10:30AM",
    "11:00AM",
    "11:30AM",
    "01:00PM",
    "01:30PM",
    "02:00PM",
    "02:30PM",
    "03:00PM",
    "03:30PM",
    "04:00PM",
    "04:30PM",
  ].filter((time) => !bookedSlots.includes(time));

  useEffect(() => {
    fetchStoreData();

    async function fetchData() {
      const data = await fetch(
        `https://eyefit-shop-800355ab3f46.herokuapp.com/api/validate/appointment?company=${selectedCompany}`,
        // `/api/validate/appointment?company=${selectedCompany}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const res = await data.json();

      const bookedDates = res.body?.reduce((acc, appointment) => {
        acc[appointment?.date] = (acc[appointment?.date] || 0) + 1;
        return acc;
      }, {});
      const fullyBooked = Object.keys(bookedDates).filter(
        (date) => bookedDates[date] >= 16
      );
      setFullyBookedDates(fullyBooked);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompany]);

  useEffect(() => {
    async function fetchData() {
      if (selectedDate) {
        const data = await fetch(
          `https://eyefit-shop-800355ab3f46.herokuapp.com/api/validate/appointment?company=${selectedCompany}`,
          // `/api/validate/appointment?company=${selectedCompany}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const res = await data.json();

        const filtered = res.body
          .filter(
            (a) => (a?.date).split("T")[0] === selectedDate.format("YYYY-MM-DD")
          )
          .map((a) => a.time);
        setBookedSlots(filtered);
      }
    }
    fetchData();
    // appointmentDataFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // const appointmentDataFetch = async () => {
  //   const data = await fetch(`/api/appointments?company=${selectedCompany}`, {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   });

  //   const res = await data.json();
  //   if (res.status === 200) {
  //     setListOfBookedDate(res.body);
  //   }
  // };

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
          {/* Adjust padding to your footer height */}
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
                  setSelectedCompany(value); // This will log the selected company
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
              />
            </Form.Item>

            {/* Time */}
            <Form.Item
              label="Select Time"
              name="time"
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
                  message: "Please select a time!",
                },
              ]}
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
                <Input
                  disabled
                  placeholder="Your name"
                  className="bg-green-100"
                />
              </Form.Item>
              <Form.Item
                label="Gender"
                name="gender"
                rules={[
                  { required: true, message: "Please enter your gemder" },
                ]}
              >
                <Input
                  disabled
                  placeholder="Your gender"
                  className="bg-green-100"
                />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { type: "email", required: true, message: "Invalid email" },
                ]}
              >
                <Input
                  disabled
                  placeholder="Your email"
                  className="bg-green-100"
                />
              </Form.Item>

              <Form.Item
                label="Phone"
                name="phone"
                rules={[{ required: true, message: "Please enter your phone" }]}
              >
                <Input
                  disabled
                  placeholder="Your phone number"
                  className="bg-green-100"
                />
              </Form.Item>

              <Form.Item
                label="Address"
                name="address"
                rules={[
                  { required: true, message: "Please enter your address" },
                ]}
              >
                <Input
                  disabled
                  placeholder="Your address"
                  className="bg-green-100"
                />
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
    </div>
  );
}
