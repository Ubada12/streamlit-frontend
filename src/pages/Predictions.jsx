import React, { useState } from "react";
import axios from "axios";

const Predictions = () => {
    const [predictionResult, setPredictionResult] = useState(null);
    const [image, setImage] = useState(null);
    const [latitude, setLatitude] = useState(20.0);
    const [longitude, setLongitude] = useState(20.0);
    const [isLoading, setIsLoading] = useState(false);
    const [preview, setPreview] = useState(null); // Image preview state

    const fetchPrediction = async () => {
        if (!image || !latitude || !longitude) {
            console.error("Please ensure the image, latitude, and longitude are set.");
            return;
        }

        setIsLoading(true);

        const formData = new FormData();
        formData.append("image", image);
        formData.append("latitude", latitude);
        formData.append("longitude", longitude);

        try {
            const response = await axios.post("http://localhost:8000/predictions", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setPredictionResult(response.data);
        } catch (error) {
            console.error("Error fetching prediction:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file)); // Show image preview
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-indigo-700">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">🌊 Flood Prediction</h1>

                {/* Image Upload */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">Upload an Image:</label>
                    <input 
                        type="file" 
                        onChange={handleImageChange} 
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>

                {/* Image Preview */}
                {preview && (
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">Preview:</p>
                        <img src={preview} alt="Preview" className="w-full h-40 object-cover rounded-md shadow" />
                    </div>
                )}

                {/* Latitude Input */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">Latitude:</label>
                    <input
                        type="number"
                        value={latitude}
                        onChange={(e) => setLatitude(parseFloat(e.target.value))}
                        step="0.0001"
                        min="-90"
                        max="90"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Longitude Input */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">Longitude:</label>
                    <input
                        type="number"
                        value={longitude}
                        onChange={(e) => setLongitude(parseFloat(e.target.value))}
                        step="0.0001"
                        min="-180"
                        max="180"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Predict Button with Animation */}
                <button 
                    onClick={fetchPrediction} 
                   disabled={!image || isLoading}
                   className={`w-full py-2 text-white font-bold rounded-md flex items-center justify-center gap-2
                       transition duration-300 ${
                           isLoading 
                               ? "bg-blue-400 cursor-wait"  // Light blue when loading
                               : image 
                                   ? "bg-blue-600 hover:bg-blue-700"  // Dark blue normally
                                   : "bg-gray-400 cursor-not-allowed"  // Gray when disabled
                       }`}
               >
                   {isLoading ? (
                       <>
                           <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                               <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
                               <path d="M22 12a10 10 0 0 1-10 10" strokeOpacity="1"></path>
                           </svg>
                           Loading...
                       </>
                   ) : (
                       "Get Prediction"
                   )}
               </button>


                {/* Prediction Result */}
                {predictionResult && (
                    <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-center text-gray-800">Prediction:</h2>
                        <p className={`text-lg font-bold text-center mt-2 ${
                            predictionResult.prediction === 1 ? "text-red-600" : "text-green-600"
                        }`}>
                            {predictionResult.prediction === 1 ? "⚠️ Flood Detected" : "✅ No Flood Detected"}
                        </p>

                        {/* Display Plots if Available */}
                        {predictionResult.plots && (
                            <div className="mt-4 grid grid-cols-1 gap-4">
                                {predictionResult.plots.map((plot, index) => (
                                    <img key={index} 
                                        src={`data:image/png;base64,${plot}`} 
                                        alt={`Plot ${index + 1}`} 
                                        className="w-full rounded-md shadow-md transform transition hover:scale-105"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Predictions;
