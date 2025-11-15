// src/components/FaceShapeDetector.jsx
import { Modal } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const MODEL_URL = "/models"; // put models under public/models

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function classifyFaceShape(jawPoints, landmarks) {
  // Simple heuristics using 68-point landmarks
  const p0 = jawPoints[0],
    p3 = jawPoints[3],
    p8 = jawPoints[8],
    p13 = jawPoints[13],
    p16 = jawPoints[16];
  const jawWidth = distance(p0, p16);
  const cheekWidth = distance(p3, p13);
  const faceLength =
    distance(landmarks.getNose()[0], p8) ||
    distance(landmarks.getNose()[6], p8) ||
    distance(landmarks.getNose()[3], p8);

  const ratioJawCheek = jawWidth / cheekWidth;
  const lengthRatio = faceLength / jawWidth;

  // Heuristic thresholds (tweak as needed)
  if (Math.abs(jawWidth - cheekWidth) / cheekWidth < 0.08 && lengthRatio < 1.05)
    return "Square";
  if (lengthRatio > 1.2 && ratioJawCheek < 0.95) return "Oval";
  if (lengthRatio < 0.95 && Math.abs(jawWidth - cheekWidth) / cheekWidth < 0.12)
    return "Round";
  // narrow jaw + wider cheek area
  if (cheekWidth / jawWidth > 1.12 && lengthRatio > 1.02) return "Diamond";
  if (cheekWidth / jawWidth > 1.05 && lengthRatio <= 1.02) return "Heart";

  return "Unknown";
}

const FaceShapeDetector = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("Loading face-api...");
  const [shape, setShape] = useState("Detecting...");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  // const [scanTrigger, setScanTrigger] = useState(0);
  const history = useNavigate();

  useEffect(() => {
    let mounted = true;
    setTimeout(() => {
      const loadScriptAndModels = async () => {
        if (!window?.faceapi) {
          const s = document.createElement("script");
          s.src = "https://unpkg.com/face-api.js/dist/face-api.min.js";
          s.crossOrigin = "anonymous";
          s.onload = async () => {
            try {
              await loadModels();
              setTimeout(() => {
                startVideo();
              }, 2000);
            } catch (err) {
              console.error(err);
              setStatus("Error loading models");
            }
          };
          s.onerror = (e) => {
            console.error("Failed to load face-api CDN", e);
            setStatus("Failed to load face-api library");
          };
          document.body.appendChild(s);
        } else {
          try {
            await loadModels();
            setTimeout(() => {
              startVideo();
            }, 2000);
          } catch (err) {
            console.error(err);
            setStatus("Error loading models");
          }
        }
      };

      const loadModels = async () => {
        setStatus("Loading models...");
        const faceapi = window.faceapi;
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        setStatus("Models loaded");
      };

      const startVideo = async () => {
        setStatus("Starting camera...");
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setStatus("Camera started");
        } catch (err) {
          console.error("Camera error:", err);
          setStatus("Camera access denied or not available");
        }
      };

      loadScriptAndModels();

      return () => {
        mounted = false;
        // stop camera if needed
        if (videoRef.current && videoRef.current.srcObject) {
          const tracks = videoRef.current.srcObject.getTracks();
          tracks.forEach((t) => t.stop());
        }
      };
    }, 5000);
  }, []);

  const TriggerScanningFace = async () => {
    let rafId;
    const faceapi = window.faceapi;
    const runDetection = async () => {
      if (
        !videoRef.current ||
        videoRef.current.readyState !== 4 ||
        !faceapi ||
        !canvasRef.current
      ) {
        rafId = requestAnimationFrame(runDetection);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const displaySize = {
        width: video.videoWidth,
        height: video.videoHeight,
      };
      faceapi.matchDimensions(canvas, displaySize);

      try {
        const detection = await faceapi
          .detectSingleFace(
            video,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 224 })
          )
          .withFaceLandmarks();

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (detection) {
          const resized = faceapi.resizeResults(detection, displaySize);
          faceapi.draw.drawFaceLandmarks(canvas, resized);

          // compute shape
          const landmarks = detection.landmarks;
          const jaw = landmarks.getJawOutline(); // array of 17 points
          const detectedShape = classifyFaceShape(jaw, landmarks);
          setShape(detectedShape);
          setStatus("Detected");

          if (detectedShape) {
            if (videoRef?.current && videoRef?.current?.srcObject) {
              videoRef.current.srcObject
                .getTracks()
                .forEach((track) => track.stop());
              videoRef.current.srcObject = null;
            }
            setShape(detectedShape);
            setStatus("Detected");
            setShowModal(true); // <-- show modal
          }
        } else {
          setShape("No face");
          setStatus("No face detected");
        }
      } catch (err) {
        console.error("Detection error", err);
        setStatus("Detection error");
      }

      rafId = requestAnimationFrame(runDetection);
    };

    rafId = requestAnimationFrame(runDetection);
    return () => cancelAnimationFrame(rafId);
  };

  useEffect(() => {
    let frameId;

    const runDetection = async () => {
      // detection code...
      frameId = requestAnimationFrame(runDetection);
    };

    frameId = requestAnimationFrame(runDetection);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      {/* Scanner Content */}
      {!loading && (
        <>
          <h1 className="text-xl font-bold mb-4">Scan for Recommendation</h1>

          <div className="relative w-full max-w-sm aspect-[3/4]">
            {/* Video */}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover rounded-lg shadow-md bg-black transform -scale-x-100"
              onLoadedMetadata={() => {
                const video = videoRef.current;
                const canvas = canvasRef.current;
                if (video && canvas) {
                  canvas.width = video.videoWidth;
                  canvas.height = video.videoHeight;
                }
              }}
            />

            {/* Canvas */}
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none rounded-lg transform -scale-x-100"
            />

            {/* Face Guide Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-3/4 h-2/3 border-2 border-blue-400/70 rounded-full"></div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">Status: {status}</p>
            <p className="mt-2 text-lg font-semibold">
              Detected shape: <span className="text-blue-600">{shape}</span>
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Tip: Center your face inside the oval guide for best detection
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-green-600 hover:bg-gray-700 text-white rounded-lg"
                onClick={() => {
                  TriggerScanningFace();
                }}
              >
                Detect
              </button>
            </div>
          </div>
        </>
      )}
      {/* Spinner Overlay */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-lg font-medium">
            Getting Recommended Eyeglasses...
          </p>
        </div>
      )}
      <Modal
        open={showModal}
        title="Detected Face Shape"
        footer={null}
        onCancel={() => {
          setShowModal(false);

          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }}
      >
        {shape !== "Unknown" ? (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">Status: {status}</p>
            <p className="mt-2 text-lg font-semibold">
              Detected shape: <span className="text-blue-600">{shape}</span>
            </p>
          </div>
        ) : (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">Status: Error</p>
            <p className="mt-2 text-lg font-semibold">
              Detected shape: <span className="text-blue-600">{shape}</span>
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Notes: Please make sure no obstacles in your face (e.g. hands,
              eyeglass, etc..)
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-center gap-4">
          <button
            hidden={shape !== "Unknown" ? false : true}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            onClick={() => {
              setShowModal(false);
              setLoading(true);

              setTimeout(() => {
                history("/home", { state: { faceShape: shape } });
              }, 8000);
            }}
          >
            Continue
          </button>
          <button
            hidden={shape === "Unknown" ? true : false}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            onClick={() => {
              setShowModal(false);
              // check if you can retain the route after reload
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }}
          >
            Cancel
          </button>
        </div>
      </Modal>
      ;
    </div>
  );
};

export default FaceShapeDetector;
