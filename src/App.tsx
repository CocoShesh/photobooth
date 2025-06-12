"use client";

import { useState, useRef, useEffect } from "react";
import { Camera } from "react-camera-pro";

export default function Photobooth() {
  const camera = useRef<any | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stripImage, setStripImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startPhotoSequence = () => {
    setIsCapturing(true);
    setCountdown(5);
  };

  const resetCapture = () => {
    setImages([]);
    setIsCapturing(false);
    setCountdown(null);
    setStripImage(null);
  };

  // Extract dominant color from an image
  const extractDominantColor = (imageUrl: string): Promise<string> => {
    return new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve("#fee2e2"); // Default color if canvas not supported
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Sample pixels from the image (simplified approach)
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let r = 0,
          g = 0,
          b = 0;
        let count = 0;

        // Sample every 10th pixel for performance
        for (let i = 0; i < data.length; i += 40) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }

        // Average the colors
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        resolve(`rgb(${r}, ${g}, ${b})`);
      };
      img.src = imageUrl;
    });
  };

  // Create photo strip from images
  const createPhotoStrip = async () => {
    if (images.length !== 3 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions for the strip
    canvas.width = 320;
    canvas.height = 800;

    // Fill background with black
    ctx.fillStyle = "#121212";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw white border
    ctx.fillStyle = "white";
    ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Fill inner area with black again
    ctx.fillStyle = "#121212";
    ctx.fillRect(30, 30, canvas.width - 60, canvas.height - 60);

    // Load and draw each image
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise(resolve => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.src = src;
      });
    };

    // Draw images with spacing
    const photoHeight = 200;
    const photoWidth = canvas.width - 80;
    const spacing = 20;

    for (let i = 0; i < images.length; i++) {
      const img = await loadImage(images[i]);
      const y = 40 + i * (photoHeight + spacing);

      // Draw white border for each photo
      ctx.fillStyle = "white";
      ctx.fillRect(40, y, photoWidth, photoHeight);

      // Draw image with small inner margin
      ctx.drawImage(img, 45, y + 5, photoWidth - 10, photoHeight - 10);

      // Draw photo counter
      ctx.fillStyle = "white";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "right";
      ctx.fillText(`${i + 1}/3`, canvas.width - 50, y + 25);
    }

    // Add text at bottom
    ctx.fillStyle = "white";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("PHOTOBOOTH MEMORIES", canvas.width / 2, canvas.height - 60);

    // Convert canvas to data URL
    setStripImage(canvas.toDataURL("image/png"));
  };

  const downloadPhotoStrip = () => {
    if (!stripImage) return;

    const link = document.createElement("a");
    link.href = stripImage;
    link.download = "photobooth-strip.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (countdown !== null) {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      } else {
        if (camera.current) {
          const newPhoto = camera.current.takePhoto();
          setImages(prevImages => [...prevImages, newPhoto]);

          if (images.length < 2) {
            setCountdown(5);
          } else {
            setIsCapturing(false);
            setCountdown(null);
          }
        }
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, images]);

  useEffect(() => {
    if (images.length === 3) {
      createPhotoStrip();
    }
  }, [images, createPhotoStrip, extractDominantColor]);

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen p-4 gap-8 bg-gray-100">
      <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Photobooth</h1>
        <div className="relative w-[400px] h-[300px] overflow-hidden rounded-md">
          <Camera
            ref={camera}
            errorMessages={{
              noCameraAccessible:
                "No camera device accessible. Please connect your camera or try a different browser.",
              permissionDenied:
                "Permission denied. Please refresh and give camera permission.",
              switchCamera:
                "It is not possible to switch camera to different one because there is only one video device accessible.",
              canvas: "Canvas is not supported.",
            }}
            aspectRatio={1}
          />
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black bg-opacity-50 text-white text-8xl font-bold rounded-full w-40 h-40 flex items-center justify-center">
                {countdown}
              </div>
            </div>
          )}
        </div>
        {images.length < 3 ? (
          <button
            className="w-[200px] h-12 bg-black text-white mt-4 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400"
            onClick={startPhotoSequence}
            disabled={isCapturing}
          >
            {isCapturing ? "Taking Photos..." : "Start Photo Sequence"}
          </button>
        ) : (
          <button
            className="w-[200px] h-12 bg-blue-500 text-white mt-4 rounded-md hover:bg-blue-600 transition-colors"
            onClick={resetCapture}
          >
            Start Again
          </button>
        )}
        <div className="flex gap-2 mt-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < images.length ? "bg-green-500" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {images.length > 0 && (
        <div className="relative p-8 rounded-lg shadow-xl transition-colors duration-300 bg-[#fee2e2]">
          <div className="bg-white p-4 rounded-md shadow-inner">
            <div className="flex flex-col gap-4">
              {images.map((img, index) => (
                <div
                  key={index}
                  className="relative h-[200px] w-[250px] border-4 border-white shadow-md overflow-hidden"
                >
                  <img
                    src={img || "/placeholder.svg?height=200&width=250"}
                    alt={`Capture ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                    {index + 1}/3
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center font-bold">
              PHOTOBOOTH MEMORIES
            </div>

            {images.length === 3 && stripImage && (
              <button
                onClick={downloadPhotoStrip}
                className="mt-4 w-full py-2 bg-green-500 text-white rounded-md flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
              >
                Download Photo Strip
              </button>
            )}
          </div>
        </div>
      )}

      {/* Hidden canvas for creating the photo strip */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
