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
  Radio,
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

const requiredFields = [
  "firstName",
  "lastName",
  "store",
  "date",
  "time",
  "gender",
  "phone",
  "address",
  "description",
];

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
  const [appointmentFor, setAppointmentFor] = useState("");

  const [disabled, setDisabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Helper: returns true if a value should be considered "empty"
  const isEmptyValue = (val) => {
    if (val === undefined || val === null) return true;
    if (typeof val === "string" && val.trim() === "") return true;
    // AntD DatePicker returns a moment/dayjs object — treat as empty if falsy
    // For arrays (eg. multiple select), treat empty array as empty
    if (Array.isArray(val) && val.length === 0) return true;
    return false;
  };

  const checkFormValidity = () => {
    // 1) If any field has validation errors -> invalid
    const fieldsError = form.getFieldsError();
    const hasErrors = fieldsError.some((f) => f.errors && f.errors.length > 0);
    if (hasErrors) {
      setDisabled(true);
      return;
    }

    // 2) Ensure all required fields have non-empty values
    const allValues = form.getFieldsValue(requiredFields);
    const anyEmptyRequired = requiredFields.some((name) => {
      const val = allValues[name];
      return isEmptyValue(val);
    });

    setDisabled(anyEmptyRequired);
  };

  // Initial check on mount (in case initialValues are provided)
  useEffect(() => {
    checkFormValidity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Called on any value change
  const onValuesChange = (_changedValues, _allValues) => {
    // small microtask to ensure AntD updates errors before we check (works around timing)
    setTimeout(() => checkFormValidity(), 0);
  };

  const currentUser = {
    name: loginData?.body?.name,
    gender: loginData?.body?.gender,
    email: loginData?.body?.email,
    phone: loginData?.body?.contact.replace("+63", ""),
    address: loginData?.body?.address,
  };

  function splitFullName(fullName = "") {
    const parts = fullName.trim().split(/\s+/);

    if (parts.length === 1) {
      return { firstName: parts[0], middleName: "", lastName: "" };
    }

    if (parts.length === 2) {
      return { firstName: parts[0], middleName: "", lastName: parts[1] };
    }

    return {
      firstName: parts[0],
      middleName: parts.slice(1, -1).join(" "),
      lastName: parts[parts.length - 1],
    };
  }

  const nameParts = splitFullName(currentUser?.name);

  const handleAppointmentForChange = (e) => {
    const value = e.target.value;
    setAppointmentFor(value);

    if (value === "self") {
      // Auto-fill from login
      form.setFieldsValue({
        firstName: nameParts.firstName,
        middleName: nameParts.middleName,
        lastName: nameParts.lastName,
        gender: currentUser?.gender || "",
        phone: currentUser?.phone || "",
        address: currentUser?.address || "",
        email: currentUser?.email || "",
      });
    } else {
      // Clear all except email
      form.setFieldsValue({
        firstName: "",
        middleName: "",
        lastName: "",
        gender: "",
        phone: "",
        address: "",
        description: "",
      });
    }

    setTimeout(() => checkFormValidity(), 0);
  };

  // Fetch business appointment config
  const fetchConfig = async (company) => {
    try {
      const res = await fetch(
        `https://eyefit-shop-047b26dc31ed.herokuapp.com/api/appointment-config/${company}`,
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
        `https://eyefit-shop-047b26dc31ed.herokuapp.com/api/available/business`,
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
        `https://eyefit-shop-047b26dc31ed.herokuapp.com/api/validate/appointment?company=${company}`,
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
    while (current.isBefore(endTime)) {
      slots.push(current.format("hh:mmA"));
      current = current.add(interval, "minute");
    }
    return slots;
  };

  const availableTime =
    selectedDate && config
      ? generateTimeSlots(config.workingHours.start, config.workingHours.end)
      : [];

  const bookedForSelectedDate =
    bookedSlots[selectedDate?.format("YYYY-MM-DD")] || [];

  const disableDates = (current) => {
    if (!config) return current.isBefore(dayjs(), "day");

    const isPast = current.isBefore(dayjs(), "day");
    const isUnavailable = config.exceptions?.includes(
      current.format("YYYY-MM-DD"),
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
        "https://eyefit-shop-047b26dc31ed.herokuapp.com/api/appointments/add",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
      );
      const res = await response.json();
      if (res.success) {
        messageApi.success("Appointment Requested!");
        form.resetFields();
        history("/account");
      } else {
        messageApi.error(res?.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      messageApi.error("Something went wrong");
    } finally {
      setSubmitting(false);
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
            onValuesChange={onValuesChange}
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
                onChange={(date) => setSelectedDate(date)} // your existing handler
                className="w-full"
                dateRender={(current) => {
                  const formatted = current.format("YYYY-MM-DD");
                  const isSelected =
                    selectedDate && current.isSame(selectedDate, "day"); // ✅ check selected date

                  // RED for exceptions
                  if (config?.exceptions?.includes(formatted)) {
                    return (
                      <div
                        style={{
                          border: "1px solid red",
                          borderRadius: "50%",
                          color: "red",
                          backgroundColor: isSelected
                            ? "#ffcccc"
                            : "transparent", // highlight if selected
                        }}
                      >
                        {current.date()}
                      </div>
                    );
                  }

                  const isWorkingDay = config?.workingDays?.includes(
                    current.day(),
                  );
                  const isFuture = current.isSameOrAfter(dayjs(), "day");

                  if (isWorkingDay && isFuture) {
                    const bookedForDay = bookedSlots[formatted] || [];
                    const totalSlots = generateTimeSlots(
                      config.workingHours.start,
                      config.workingHours.end,
                    );
                    const availableSlots = totalSlots.filter(
                      (slot) => !bookedForDay.includes(slot),
                    );

                    if (availableSlots.length > 0) {
                      return (
                        <div
                          style={{
                            border: "1px solid green",
                            borderRadius: "50%",
                            color: "green",
                            backgroundColor: isSelected
                              ? "#a7f3d0"
                              : "transparent",
                          }}
                        >
                          {current.date()}
                        </div>
                      );
                    }
                  }

                  return (
                    <div
                      style={{
                        borderRadius: "50%",
                        backgroundColor: isSelected ? "#bae6fd" : "transparent",
                        color: isSelected ? "black" : "inherit",
                      }}
                    >
                      {current.date()}
                    </div>
                  );
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
                  availableTime.map((time) => {
                    const isBooked = bookedForSelectedDate.includes(time);
                    return (
                      <Select.Option
                        key={time}
                        value={time}
                        disabled={isBooked}
                      >
                        {time} {isBooked && "(Booked)"}
                      </Select.Option>
                    );
                  })
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
              <Form.Item className="mb-2">
                <Radio.Group
                  onChange={handleAppointmentForChange}
                  value={appointmentFor}
                  className="flex justify-center gap-6"
                >
                  <Radio value="self">For Myself</Radio>
                  <Radio value="other">For Someone Else</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[
                  { required: true, message: "Please enter the first name" },
                  { max: 40, message: "Name can not exceed 40 characters" },
                ]}
              >
                <Input
                  placeholder="Enter First Name"
                  className="bg-green-100"
                />
              </Form.Item>
              <Form.Item
                label="Middle Name"
                name="middleName"
                rules={[
                  { message: "Please enter the middle name" },
                  { max: 40, message: "Name can not exceed 40 characters" },
                ]}
              >
                <Input
                  placeholder="Enter Middle Name"
                  className="bg-green-100"
                />
              </Form.Item>
              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[
                  { required: true, message: "Please enter the last name" },
                  { max: 40, message: "Name can not exceed 40 characters" },
                ]}
              >
                <Input placeholder="Enter Last Name" className="bg-green-100" />
              </Form.Item>
              <Form.Item
                label="Gender"
                name="gender"
                rules={[
                  { required: true, message: "Please select your gender" },
                ]}
              >
                <Select
                  placeholder="Select Gender"
                  className="custom-select bg-green-100"
                  popupClassName="bg-green-50" // dropdown background
                >
                  <Option value="male">Male</Option>
                  <Option value="female">Female</Option>
                  <Option value="other">Other</Option>
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
                  addonBefore={
                    <span className="bg-green-100 text-gray px-3 py-1 rounded-l-md">
                      +63
                    </span>
                  }
                  className="!bg-green-100 rounded-l-none"
                  maxLength={10}
                  placeholder="9XXXXXXXXX"
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) e.preventDefault();
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
                <Input
                  placeholder="Enter your complete address"
                  className="bg-green-100"
                />
              </Form.Item>
              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: "Please add description!" }]}
              >
                <TextArea
                  placeholder="Enter your description of the appointment"
                  rows={3}
                  className="bg-green-100"
                />
              </Form.Item>
            </div>

            {/* Submit */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                disabled={disabled || submitting}
                loading={submitting}
                className={`w-full rounded-full border-none ${
                  disabled
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                }`}
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
