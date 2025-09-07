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
            <div
                style={{
                    height: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "#f8f9fa",
                    color: "#333",
                    textAlign: "center",
                    padding: "20px",
                }}
            >
                <img
                    src="public\no-internet.jpg" // Optional: put an image in your public folder
                    alt="No Internet"
                    style={{ width: "150px", marginBottom: "20px" }}
                />
                <h2>No Internet Connection</h2>
                <p>Please check your network and try again.</p>
            </div>
        );
    }

    return <>{children}</>;
};

export default NoInternetWrapper;
