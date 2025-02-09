import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const threeRef = useRef(null);
  
  // Add state for tracking current image indices
  const [imageIndices, setImageIndices] = useState({
    drainage: 0,
    lowLying: 0,
    rainfall: 0
  });

  // Image arrays for each card
  const cardImages = {
    drainage: [
      new URL('../assets/home_page_drainage_choked_1.jpg', import.meta.url).href,
      new URL('../assets/home_page_drainage_choked_2.jpg', import.meta.url).href,
      new URL('../assets/home_page_drainage_choked_3.jpg', import.meta.url).href,
      new URL('../assets/home_page_drainage_choked_4.jpg', import.meta.url).href,
      new URL('../assets/home_page_drainage_choked_5.jpg', import.meta.url).href,
      new URL('../assets/home_page_drainage_choked_6.jpg', import.meta.url).href,
      new URL('../assets/home_page_drainage_choked_7.jpg', import.meta.url).href
    ],
    lowLying: [
      new URL('../assets/low_line_area.jpg', import.meta.url).href
    ],
    rainfall: [
      new URL('../assets/annual_rainfall_graph.jpg', import.meta.url).href
    ]
  };

  // Handler for cycling through images
  const cycleImage = (category) => {
    setImageIndices(prev => ({
      ...prev,
      [category]: (prev[category] + 1) % cardImages[category].length
    }));
  };

  // Optional: Add image dimension validation
  const validateImageDimensions = (img) => {
    return new Promise((resolve) => {
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        // Ideal aspect ratio is around 16:9 or 4:3
        if (aspectRatio < 1 || aspectRatio > 2) {
          console.warn(`Image ${img.src} has non-optimal aspect ratio: ${aspectRatio}`);
        }
        resolve();
      };
    });
  };

  // Optional: Preload and validate images
  useEffect(() => {
    Object.values(cardImages).flat().forEach(imageSrc => {
      const img = new Image();
      img.src = imageSrc;
      validateImageDimensions(img);
    });
  }, []);

  useEffect(() => {
    // Scene Setup
    const scene = new THREE.Scene();
    
    // Make camera aspect ratio match container
    const container = threeRef.current;
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    
    // Make renderer match container size
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement); // Store reference to renderer element
    
    // Add resize handler
    const handleResize = () => {
      const newAspect = container.clientWidth / container.clientHeight;
      camera.aspect = newAspect;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    let videoTexture = null;
    let plane = null;

    // Video setup
    const video = document.createElement("video");
    video.src = new URL('../assets/landing.webm', import.meta.url).href;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";

    // Initialize video and scene elements
    video.addEventListener('loadedmetadata', () => {
      videoTexture = new THREE.VideoTexture(video);
      videoTexture.format = THREE.RGBAFormat;
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;
      videoTexture.encoding = THREE.sRGBEncoding;

      // Calculate plane size to maintain video aspect ratio
      const videoAspect = video.videoWidth / video.videoHeight;
      let planeWidth = 8; // Base width
      let planeHeight = planeWidth / videoAspect;

      const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
      const material = new THREE.MeshBasicMaterial({
        map: videoTexture,
        transparent: true,
        side: THREE.DoubleSide,
      });

      plane = new THREE.Mesh(geometry, material);
      scene.add(plane);
      
      // Adjust camera position based on plane size
      camera.position.z = planeHeight * 0.7 + 3;
      
      video.play();
    });

    // Lighting
    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(2, 2, 5);
    scene.add(light);

    // Mouse Effect (Parallax Effect)
    window.addEventListener("mousemove", (event) => {
      let mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      let mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
      if (plane) {
        plane.rotation.y = mouseX * 0.1;
        plane.rotation.x = mouseY * 0.1;
      }
    });

    // Camera & Controls
    new OrbitControls(camera, renderer.domElement);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (video.readyState === video.HAVE_ENOUGH_DATA && videoTexture) {
        videoTexture.needsUpdate = true;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      // Safely remove renderer element
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      
      // Clean up video
      if (video) {
        video.pause();
        video.remove();
      }
      
      // Dispose of Three.js resources
      if (videoTexture) {
        videoTexture.dispose();
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <main className="container mx-auto px-4 py-8">
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-4">Welcome to XAI-FLOWS</h2>
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="w-full md:w-1/2">
              <p className="text-lg mb-4">
                XAI-FLOWS is an innovative platform designed to revolutionize flood monitoring and prediction. By
                combining cutting-edge AI technology with explainability, XAI-FLOWS provides accurate and transparent
                flood warnings, predicting potential flooding events before they occur, empowering communities, and
                informing decision-makers.
              </p>
              <p className="text-lg mb-4">
                Our mission is to ensure safety and preparedness by delivering insights that are not only reliable but
                also interpretable. XAI-FLOWS helps bridge the gap between technology and trust, offering users a clear
                understanding of the data and predictions that drive flood warning systems.
              </p>
              <blockquote className="border-l-4 border-blue-500 pl-4 italic text-xl text-blue-700 my-8">
                "Our platform not only predicts floods, but also helps you prepare by providing real-time alerts based
                on AI-driven data analysis."
              </blockquote>
              <Button 
                onClick={() => navigate('/predictions')}
                className="bg-blue-600 hover:bg-blue-700 transform hover:scale-105 transition-all duration-300"
              >
                Explore Our Platform
              </Button>
            </div>
            <div className="w-full md:w-1/2 mt-4 md:mt-8 block">
              <div 
                ref={threeRef} 
                className="rounded-lg shadow-lg w-full aspect-video overflow-hidden flex items-center justify-center bg-gray-900/10"
              ></div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
          <p className="text-lg">
            At XAI-FLOWS, our vision is to build smarter, safer communities by utilizing the power of Artificial
            Intelligence and Explainable AI to forecast flood risks with precision. We aim to help authorities and
            citizens make informed decisions that protect both lives and property, creating a world where flooding
            disasters are predictable, manageable, and preventable.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Our Goals</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Prevent Drainage Blockages and Flooding</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  We are committed to addressing drainage issues that lead to flooding. By analyzing drainage systems
                  and predicting blockages before they occur, we help mitigate the risk of floods, ensuring smoother
                  water flow during heavy rains.
                </p>
                <div 
                  onClick={() => cycleImage('drainage')}
                  className="mt-4 h-72 relative cursor-pointer overflow-hidden rounded-lg group"
                >
                  <img 
                    src={cardImages.drainage[imageIndices.drainage]}
                    alt="Drainage system visualization"
                    className="absolute inset-0 w-full h-full object-contain md:object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Focus on Low-Lying Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Low-lying areas are most vulnerable to flooding, and they require special attention. Our system
                  focuses on identifying these areas and providing timely flood risk assessments to reduce the impact on
                  affected communities.
                </p>
                <div 
                  onClick={() => cycleImage('lowLying')}
                  className="mt-4 h-72 relative cursor-pointer overflow-hidden rounded-lg group"
                >
                  <img 
                    src={cardImages.lowLying[imageIndices.lowLying]}
                    alt="Low-lying areas visualization"
                    className="absolute inset-0 w-full h-full object-contain md:object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Monitor Annual Rainfall Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  By analyzing annual rainfall patterns, XAI-FLOWS can predict potential flood risks based on rainfall
                  volume and intensity, allowing for better preparedness in flood-prone regions.
                </p>
                <div 
                  onClick={() => cycleImage('rainfall')}
                  className="mt-4 h-72 relative cursor-pointer overflow-hidden rounded-lg group"
                >
                  <img 
                    src={cardImages.rainfall[imageIndices.rainfall]}
                    alt="Rainfall trends visualization"
                    className="absolute inset-0 w-full h-full object-contain md:object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-8">System Features</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "AI-Driven Flood Predictions",
                description:
                  "Powered by advanced AI models, XAI-FLOWS predicts flood risks by analyzing a combination of drainage conditions, rainfall data, and geographical features.",
              },
              {
                title: "Real-Time Monitoring",
                description:
                  "Stay up-to-date with real-time monitoring of flood-prone areas. Our platform continuously tracks environmental factors to provide the most accurate flood predictions available.",
              },
              {
                title: "Explainable AI",
                description:
                  "Unlike traditional AI models, XAI-FLOWS offers transparency by providing clear, understandable explanations of the predictions.",
              },
              {
                title: "Flood Risk Alerts",
                description:
                  "Get notified instantly when flood risks are detected in your area. Our alert system ensures you receive timely warnings, allowing you to prepare and act before a disaster strikes.",
              },
              {
                title: "User-Friendly Interface",
                description:
                  "Designed with users in mind, XAI-FLOWS offers an intuitive interface that allows anyone—from local authorities to concerned citizens—to quickly access flood predictions, insights, and alerts.",
              },
              {
                title: "Interactive Visualization Tools",
                description:
                  "Explore detailed maps and graphs that visualize flood risks, drainage conditions, and rainfall patterns. Our interactive tools help you better understand the situation in your region and make more informed decisions.",
              },
            ].map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default Home;