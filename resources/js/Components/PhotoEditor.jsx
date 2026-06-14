import { useState, useRef, useEffect } from 'react';
import { X, RotateCw, Crop, Sun, Contrast, Save } from 'lucide-react';

export default function PhotoEditor({ imageUrl, onSave, onCancel }) {
    const canvasRef = useRef(null);
    const [rotation, setRotation] = useState(0);
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [cropMode, setCropMode] = useState(false);
    const [cropArea, setCropArea] = useState(null);
    const [image, setImage] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(null);

    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            setImage(img);
            drawImage(img);
        };
        img.src = imageUrl;
    }, [imageUrl]);

    useEffect(() => {
        if (image) {
            drawImage(image);
        }
    }, [rotation, brightness, contrast, cropArea]);

    const drawImage = (img) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Calculate dimensions
        const maxWidth = 600;
        const maxHeight = 400;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.clearRect(0, 0, width, height);

        // Apply transformations
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate((rotation * Math.PI) / 180);

        // Apply filters
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

        ctx.drawImage(img, -width / 2, -height / 2, width, height);
        ctx.restore();

        // Draw crop overlay if in crop mode
        if (cropMode && cropArea) {
            ctx.strokeStyle = '#3B82F6';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

            // Draw dimmed overlay outside crop area
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(0, 0, width, cropArea.y);
            ctx.fillRect(0, cropArea.y, cropArea.x, cropArea.height);
            ctx.fillRect(cropArea.x + cropArea.width, cropArea.y, width - (cropArea.x + cropArea.width), cropArea.height);
            ctx.fillRect(0, cropArea.y + cropArea.height, width, height - (cropArea.y + cropArea.height));
        }
    };

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    const toggleCropMode = () => {
        if (!cropMode) {
            const canvas = canvasRef.current;
            const size = Math.min(canvas.width, canvas.height) * 0.8;
            setCropArea({
                x: (canvas.width - size) / 2,
                y: (canvas.height - size) / 2,
                width: size,
                height: size,
            });
        }
        setCropMode(!cropMode);
    };

    const handleMouseDown = (e) => {
        if (!cropMode) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setIsDragging(true);
        setDragStart({ x, y });
        setCropArea({ x, y, width: 0, height: 0 });
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !dragStart) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const width = x - dragStart.x;
        const height = y - dragStart.y;

        setCropArea({
            x: width > 0 ? dragStart.x : x,
            y: height > 0 ? dragStart.y : y,
            width: Math.abs(width),
            height: Math.abs(height),
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setDragStart(null);
    };

    const handleSave = async () => {
        const canvas = canvasRef.current;
        let finalCanvas = canvas;

        // If crop mode is active, create a new canvas with cropped image
        if (cropMode && cropArea && cropArea.width > 0 && cropArea.height > 0) {
            finalCanvas = document.createElement('canvas');
            finalCanvas.width = cropArea.width;
            finalCanvas.height = cropArea.height;
            const ctx = finalCanvas.getContext('2d');

            ctx.drawImage(
                canvas,
                cropArea.x, cropArea.y, cropArea.width, cropArea.height,
                0, 0, cropArea.width, cropArea.height
            );
        }

        // Convert to blob and then to base64
        finalCanvas.toBlob((blob) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                onSave(reader.result);
            };
            reader.readAsDataURL(blob);
        }, 'image/jpeg', 0.9);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Edit Photo</h3>
                    <button
                        onClick={onCancel}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 overflow-auto p-6 bg-gray-50 flex items-center justify-center">
                    <canvas
                        ref={canvasRef}
                        className="max-w-full border border-gray-300 rounded-lg bg-white shadow-sm cursor-crosshair"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    />
                </div>

                {/* Controls */}
                <div className="p-4 border-t border-gray-200 bg-white space-y-4">
                    {/* Tool Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRotate}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <RotateCw className="w-4 h-4" />
                            Rotate 90°
                        </button>
                        <button
                            onClick={toggleCropMode}
                            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                cropMode
                                    ? 'text-white bg-blue-600 hover:bg-blue-700'
                                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            <Crop className="w-4 h-4" />
                            {cropMode ? 'Crop Mode ON' : 'Crop'}
                        </button>
                    </div>

                    {/* Sliders */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Brightness */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <Sun className="w-4 h-4" />
                                    Brightness
                                </label>
                                <span className="text-sm text-gray-500">{brightness}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="200"
                                value={brightness}
                                onChange={(e) => setBrightness(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>

                        {/* Contrast */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <Contrast className="w-4 h-4" />
                                    Contrast
                                </label>
                                <span className="text-sm text-gray-500">{contrast}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="200"
                                value={contrast}
                                onChange={(e) => setContrast(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>
                    </div>

                    {cropMode && (
                        <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                            💡 Click and drag on the image to select the crop area
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
