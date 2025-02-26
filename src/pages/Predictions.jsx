import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaWind, FaCloudRain, FaSun, FaTachometerAlt, FaThermometerHalf, FaTint, FaEye, FaSmog, FaMoon, FaCloudSun, FaWater, FaCloudShowersHeavy } from 'react-icons/fa';
import { Bar } from "react-chartjs-2";
import { CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar as RechartBar } from "recharts";
import { motion } from "framer-motion";
import "chart.js/auto";

// Utility functions (same as previous code)
const getAirState = (rh, dewpt) => {
  if (rh < 30 && dewpt < 10) return "Very Dry";
  if (rh < 40 && dewpt < 15) return "Dry";
  if (rh >= 40 && rh <= 60 && dewpt >= 10) return "Moderate Humidity";
  return "Humid";
};

const getWindDirection = (windDir) => {
  const directions = ["North", "Northeast", "East", "Southeast", "South", "Southwest", "West", "Northwest"];
  return directions[Math.round(windDir / 45) % 8];
};

const getCloudCoverage = (clouds) => {
  if (clouds === 0) return "Clear Sky";
  if (clouds < 30) return "Partly Cloudy";
  if (clouds < 70) return "Mostly Cloudy";
  return "Overcast";
};

const getTimeOfDay = (hour) => {
  if (hour >= 5 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 17) return "Afternoon";
  if (hour >= 17 && hour < 20) return "Evening";
  return "Night";
};

const FloodPredictionDashboard = () => {
  const [streaming, setStreaming] = useState(true);
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [weather, setWeather] = useState(null);
  const [weatherShapData, setWeatherShapData] = useState([]);
  const intervalRef = useRef(null);
  const [longitude, setLongitude] = useState(12.9716);
  const [latitude, setLatitude] = useState(77.5946);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStreaming(!streaming);
    if (streaming) {
      fetchData();
      intervalRef.current = setInterval(fetchData, 20000);
    } else {
      clearInterval(intervalRef.current);
    }
  };

  const fetchData = async () => {
    try {
      const listResponse = await axios.get("http://localhost:8000/api/get-latest-s3-image");
      if (listResponse.data.imageBase64) {
        const imageBase64 = listResponse.data.imageBase64;
        setImage(`data:image/jpeg;base64,${imageBase64}`);

        const byteCharacters = atob(imageBase64);
        const byteArray = new Uint8Array(byteCharacters.length);
        byteCharacters.split("").forEach((char, i) => (byteArray[i] = char.charCodeAt(0)));
        const file = new Blob([byteArray], { type: "image/jpeg" });

        const formData = new FormData();
        formData.append("image", file, "image.jpg");
        formData.append("request", JSON.stringify({ lon: longitude, lat: latitude }));

        const predictionResponse = await axios.post("http://localhost:8000/predict-flood/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const data = predictionResponse.data;
        setPrediction({
          floodRisk: data.prediction.flood_risk,
          reason: data.prediction.reason,
          drainBlockageProb: data.drain_blockage_prob,
          drainBlockage: data.drain_blockage,
        });

        setWeather({
          temp: data.weather_data.temp,
          appTemp: data.weather_data.app_temp,
          humidity: data.weather_data.rh,
          windSpeed: data.weather_data.wind_spd,
          uv: data.weather_data.uv,
          pressure: data.weather_data.pres,
          visibility: data.weather_data.vis,
          weatherCondition: data.weather_prediction.weather,
          precipitation: data.weather_prediction.precip,
          airState: getAirState(data.weather_data.rh, data.weather_data.dewpt),
          windDirection: getWindDirection(data.weather_data.wind_dir),
          cloudCoverage: getCloudCoverage(data.weather_data.clouds),
          timeOfDay: getTimeOfDay(data.weather_data.hour),
        });

        setWeatherShapData(data.weather_shap_value || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("An error occurred while fetching data. Please try again.");
    }
  };

  const weatherShapeChartData = {
    labels: weatherShapData?.map((item) => item.feature) || [],
    datasets: [
      {
        label: "Weather SHAP Values",
        data: weatherShapData?.map((item) => item.value) || [],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  return (
    <motion.div 
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-indigo-700 p-6"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 1 }}
    >
      <motion.div 
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl" 
        whileHover={{ scale: 1.02 }} 
        transition={{ type: "spring", stiffness: 150 }}
      >
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">🌊 Flood Prediction</h1>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Longitude:</label>
          <input
            type="text"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Latitude:</label>
          <input
            type="text"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <motion.button
          onClick={handleSubmit}
          className={`w-full py-2 text-white font-bold rounded-md flex items-center justify-center gap-2
            transition duration-100 ${!streaming ? "bg-red-600" : "bg-blue-600 hover:bg-blue-700"}`}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          {!streaming ? "Stop Streaming" : "Start Streaming"}
        </motion.button>

        {/* Display Latest Image */}
        {image && (
          <motion.div className="mt-4" initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
            <img src={image} alt="Latest Flood Image" className="w-full rounded-md shadow" />
          </motion.div>
        )}

        {/* Prediction Data */}
        {prediction && (
          <motion.div 
          className={`mt-6 p-6 rounded-lg shadow-md ${
            prediction.drainBlockage === 1
              ? "bg-green-100"
              : prediction.drainBlockage === 0
              ? "bg-red-100"
              : prediction.drainBlockage === 2
              ? "bg-yellow-100"
              : ""
          }`}
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 1 }}
          >
            <h2 className="text-xl font-semibold text-center text-gray-800">Prediction:</h2>
            <h2
              className={`text-xl font-bold text-center ${
              prediction.drainBlockage === 1
                ? "text-green-400"  // No flood detected (green)
                : prediction.drainBlockage === 0
                ? "text-red-400"    // Flood detected (red)
                : prediction.drainBlockage === 2
                ? "text-yellow-400" // Semi flood detected (yellow)
                : "text-gray-800"   // Default color if no valid status
            }`}
            >
               {prediction.drainBlockage === 1 && (
                  <FaWater size={30} className="inline-block mr-2" />
                )}
               {prediction.drainBlockage === 0 && (
                 <FaCloudShowersHeavy size={30} className="inline-block mr-2" />
               )}
               {prediction.drainBlockage === 2 && (
                 <FaCloudRain size={30} className="inline-block mr-2" />
               )}
            {prediction.drainBlockage === 1
              ? "No Flood Detected"
              : prediction.drainBlockage === 0
              ? "Flood Detected"
              : prediction.drainBlockage === 2
              ? "Semi Flood Detected"
              : "Unknown Flood Status"}
            </h2>

            <div className="mt-4">
              <p className={`text-lg font-bold text-center mt-2 
                ${prediction.drainBlockage === 1 
                  ? "text-green-800" 
                  : "text-red-800"}`}
              >
                Flood Risk: {prediction.floodRisk}
              </p>
              <p className="mt-2 text-center text-gray-700">Reason: {prediction.reason}</p>
            </div>

            <div className="mt-4">
              <p className="text-lg text-center">Drain Blockage Prediction: {prediction.drainBlockageProb}%</p>
            </div>
          </motion.div>
        )}
        
       {/* Weather Info */}
       {weather && (
         <motion.div
           className="mt-6 p-6 rounded-lg shadow-md bg-blue-100"
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 1 }}
         >
           <h2 className="text-xl font-semibold text-center text-gray-800">Weather Conditions</h2>

           <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-6">
             {/* Temperature and Apparent Temperature */}
             <div className="text-center">
               <div className="flex justify-center items-center text-blue-600">
                 <FaThermometerHalf size={30} />
               </div>
               <p className="mt-2 text-gray-800"><span className="font-semibold">Temperature:</span> {weather.temp}°C</p>
               <p className="text-gray-600"><span className="font-semibold">Feels Like:</span> {weather.appTemp}°C</p>
             </div>
       
             {/* Wind Speed and Wind Direction */}
             <div className="text-center">
               <div className="flex justify-center items-center text-green-600">
                 <FaWind size={30} />
               </div>
               <p className="mt-2 text-gray-800"><span className="font-semibold">Wind Speed:</span> {weather.windSpeed} m/s</p>
               <p className="text-gray-600"><span className="font-semibold">Wind Direction:</span> {weather.windDirection}</p>
             </div>

             {/* Precipitation and Weather Condition */}
             <div className="text-center">
               <div className="flex justify-center items-center text-blue-600">
                 <FaCloudRain size={30} />
               </div>
               <p className="mt-2 text-gray-800"><span className="font-semibold">Precipitation:</span> {weather.precip === 0 ? "No Precipitation" : "Precipitation Expected"}</p>
               <p className="text-gray-600"><span className="font-semibold">Condition:</span> {weather.weatherCondition}</p>
             </div>

             {/* Humidity and Cloud Coverage */}
             <div className="text-center">
               <div className="flex justify-center items-center text-blue-600">
                 <FaTint size={30} />
               </div>
               <p className="mt-2 text-gray-800"><span className="font-semibold">Humidity:</span> {weather.humidity}%</p>
               <p className="text-gray-600"><span className="font-semibold">Cloud Coverage:</span> {weather.cloudCoverage}</p>
             </div>

             {/* UV Index and Pressure */}
             <div className="text-center">
               <div className="flex justify-center items-center text-gray-600">
                 <FaTachometerAlt size={30}/>
               </div>
               <p className="mt-2 text-gray-800"><span className="font-semibold">UV Index:</span> {weather.uv}</p>
               <p className="text-gray-600"><span className="font-semibold">Pressure:</span> {weather.pressure} mb</p>
             </div>

             {/* Time of Day and Air State */}
             <div className="text-center">
               <div className="flex justify-center items-center text-gray-600">
                 <FaSmog size={30}/>
               </div>
               <p className="text-gray-600"><span className="font-semibold">Air State:</span> {weather.airState}</p>
             </div>

             {/* Visibility */}
             <div className="text-center">
               <div className="flex justify-center items-center text-gray-600">
                 <FaEye size={30} />
               </div>
               <p className="mt-2 text-gray-800"><span className="font-semibold">Visibility:</span> {weather.visibility} km</p>
             </div>

             {/* Time of Day Icons */}
             <div className="text-center">
               <div className="flex justify-center items-center">
                 {weather.timeOfDay === 'Morning' && (
                   <FaSun size={30} className="text-yellow-500" />
                 )}
                 {weather.timeOfDay === 'Night' && (
                   <FaMoon size={30} className="text-gray-600" />
                 )}
                 {weather.timeOfDay === 'Evening' && (
                   <FaCloudSun size={30} className="text-yellow-600" />
                 )}
               </div>
               <p className="mt-2 text-gray-800"><span className="font-semibold">Time of Day:</span> {weather.timeOfDay}</p>
             </div>
           </div>
         </motion.div>
       )}

        {/* SHAP Values Chart */}
        {weatherShapData.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-center text-gray-800">Weather SHAP Values:</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weatherShapData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="feature" />
                <YAxis />
                <Tooltip />
                <RechartBar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* waterfall Values Chart */}
        {weatherShapData.length > 0 && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-md">
          <div className="mt-6">
          <h2 className="text-xl font-semibold text-center text-gray-800">Weather SHAP Values</h2>
          <Bar data={weatherShapeChartData} options={{ responsive: true }} />
        </div>
        </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default FloodPredictionDashboard;
