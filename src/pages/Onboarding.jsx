import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useNavigate } from "react-router-dom";

const slides = [
  {
    id: 1,
    icon: "👓", // Eyeglasses icon
    title: "Find Your Perfect Eyewear",
    description: "Browse hundreds of frames that match your style.",
  },
  {
    id: 2,
    icon: "📸", // Camera icon for virtual try-on
    title: "Virtual Try-On",
    description: "Scan your face and try on glasses virtually.",
  },
  {
    id: 3,
    icon: "🛒", // Shopping cart icon
    title: "Easy Shopping",
    description: "Choose, checkout, and receive your glasses at home.",
  },
];

export default function Onboarding({ onFinish }) {
  const history = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  const handleGetStarted = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    history("/home");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 to-blue-100 pb-24">
      <Swiper
        modules={[Pagination]}
        spaceBetween={50}
        slidesPerView={1}
        pagination={{ clickable: true }}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        className="w-full max-w-sm"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="flex flex-col items-center justify-center text-center p-6">
              <div className="text-6xl mb-6">{slide.icon}</div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">
                {slide.title}
              </h2>
              <p className="text-gray-600 mb-10">{slide.description}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {activeIndex === slides.length - 1 && (
        <button
          onClick={handleGetStarted}
          className="mt-8 px-6 py-3 bg-green-600 text-white font-semibold rounded-full shadow hover:bg-green-700 transition"
        >
          Get Started
        </button>
      )}
    </div>
  );
}
