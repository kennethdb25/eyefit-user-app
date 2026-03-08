/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import {
  bootstrapCameraKit,
  createMediaStreamSource,
  Transform2D,
} from "@snap/camera-kit";
import { useLocation, useNavigate } from "react-router-dom";

export default function FaceScan() {
  const containerRef = useRef(null); // Parent div to append canvas
  const sessionRef = useRef(null);
  const streamRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation(); // Detect route changes
  const history = useNavigate();

  useEffect(() => {
    let mounted = true;
    let canvas;

    (async function initAR() {
      console.log(location);
      Object.defineProperty(navigator, "userAgent", {
        get: () => "Chrome/120.0.0.0",
      });
      try {
        const cameraKit = await bootstrapCameraKit({
          apiToken:
            "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzU3NTkyMjAwLCJzdWIiOiJhMzYzOTZiNS1kNjBiLTQ4MmQtYTBlMS1jZWU5YjM1MGIxMzF-U1RBR0lOR35hYTk1ZDEyZC1iY2I3LTQ0NDgtODcwMi1iYTkyM2U0Zjc5OGMifQ.6fImaPnCs9cfttNnGllXMOiGrc3JXFPlZ2JtEjnjcOc", // Replace with your token
        });

        // Create a new canvas dynamically
        canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        containerRef?.current?.appendChild(canvas);

        const session = await cameraKit?.createSession({
          liveRenderTarget: canvas,
        });
        sessionRef.current = session;

        session?.events?.addEventListener("error", (event) => {
          if (event.detail.error.name === "LensExecutionError") {
            console.error("Lens crashed:", event?.detail?.error);
          }
        });
        navigator?.mediaDevices.getUserMedia({ video: true });
        const stream = await navigator?.mediaDevices?.getUserMedia({
          video: { facingMode: "user" },
        });
        streamRef.current = stream;

        const source = createMediaStreamSource(stream, {
          transform: Transform2D.MirrorX,
          cameraType: "front",
        });

        await session.setSource(source);

        const lens = await cameraKit?.lensRepository?.loadLens(
          location?.state?.id,
          "346e91f1-072e-4653-aaf3-54fc658c9d0d",
        );
        await session.applyLens(lens);

        await session.play();
        if (!mounted) await session.destroy();
        setLoading(false);
      } catch (err) {
        console.error("CameraKit Init Error:", err);
        setError(err.message);
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      (async () => {
        try {
          if (sessionRef.current) {
            await sessionRef.current.stop();
            await sessionRef.current.destroy();
          }
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
          }
          if (canvas && containerRef.current?.contains(canvas)) {
            containerRef.current.removeChild(canvas);
          }
        } catch (cleanupErr) {
          console.error("Cleanup error:", cleanupErr);
        }
      })();
    };
  }, [location?.pathname]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-screen bg-gradient-to-b from-green-200 to-green-400">
      {/* Floating Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 backdrop-blur-md bg-white/30 z-20">
        <h1 className="text-black text-lg md:text-xl font-bold tracking-wide">
          👓 Try On Eyeglasses
        </h1>

        <button
          onClick={() => {
            history("/home");
            window.location.reload();
          }}
          className="px-4 py-2 bg-black text-white text-sm rounded-full shadow-md hover:bg-gray-800 transition"
        >
          ⬅ Exit
        </button>
      </div>

      {/* Camera Container */}
      <div
        ref={containerRef}
        className="relative w-full max-w-sm aspect-[6/16] rounded-2xl overflow-hidden shadow-2xl border border-gray-700 bg-black"
      >
        {(loading || error) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            {loading && !error && (
              <>
                <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-white text-sm">Loading AR Camera...</p>
              </>
            )}

            {error && (
              <p className="text-red-400 text-sm text-center px-4">{error}</p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Hint */}
      <p className="text-xs text-gray-700 mt-4 opacity-70">
        Position your face inside the frame
      </p>
    </div>
  );
}
