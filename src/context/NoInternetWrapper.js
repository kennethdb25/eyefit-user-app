import React, { useEffect, useState } from "react";

const NoInternetWrapper = ({ children }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (!isOnline) {
        return (
            <div className="h-screen flex flex-col justify-center items-center bg-gray-100 text-gray-800 p-6">
                <div className="text-6xl mb-4">📡</div>
                <h2 className="text-2xl font-semibold mb-2">No Internet Connection</h2>
                <p className="text-gray-600 mb-6 text-center">
                    Please check your network and try again.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                >
                    Retry
                </button>
            </div>
        );
    }

    return <>{children}</>;
};

export default NoInternetWrapper;
