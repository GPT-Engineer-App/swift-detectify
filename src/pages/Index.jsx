import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import { Play, Square, Settings, History, Info, AlertCircle, Camera } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { saveCountsToIndexedDB, getCountsFromIndexedDB } from '../utils/localStorage';
import { detectObjects, loadModel } from '../utils/objectDetection';
import { useSettings } from '../hooks/useSettings';

const Index = () => {
  const [isDetecting, setIsDetecting] = React.useState(false);
  const [counts, setCounts] = React.useState({
    glass: 0,
    can: 0,
    pet1: 0,
    hdpe2: 0,
    carton: 0
  });

  useEffect(() => {
    const loadCounts = async () => {
      const storedCounts = await getCountsFromIndexedDB();
      setCounts(storedCounts);
    };
    loadCounts();
  }, []);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const { toast } = useToast();
  const { settings, getModelFile } = useSettings();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => console.log('Service Worker registered with scope:', registration.scope))
        .catch(error => console.error('Service Worker registration failed:', error));
    }

    // Load the TensorFlow.js model
    const loadModelFile = async () => {
      if (settings.modelFileName) {
        try {
          const modelFile = await getModelFile(settings.modelFileName);
          if (modelFile) {
            await loadModel(modelFile);
            setError(null); // Clear any previous errors
            toast({
              title: "Model Loaded",
              description: "Object detection model loaded successfully.",
            });
          } else {
            setError("Model file not found. Please upload the TensorFlow.js model file in settings.");
          }
        } catch (error) {
          console.error("Failed to load the model:", error);
          setError(`Failed to load the object detection model: ${error.message}. Please check the model file in settings and try again.`);
        }
      } else {
        setError("Model file is not set. Please upload the TensorFlow.js model file in settings.");
      }
    };

    loadModelFile();
  }, [settings.modelFileName, getModelFile, toast]);

  useEffect(() => {
    saveCountsToIndexedDB(counts);
  }, [counts]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing the camera:", err);
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Unable to access the camera. Please check your permissions.",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const toggleDetection = () => {
    setIsDetecting(prev => !prev);
    if (!isDetecting) {
      startCamera();
      startDetection();
      toast({
        title: "Detection Started",
        description: "The system is now detecting and counting objects.",
      });
    } else {
      stopCamera();
      stopDetection();
      toast({
        title: "Detection Stopped",
        description: "Object detection has been stopped.",
      });
    }
  };

  const startDetection = () => {
    const detectFrame = async () => {
      if (videoRef.current && isDetecting) {
        try {
          if (!videoRef.current.videoWidth || !videoRef.current.videoHeight) {
            console.log("Video dimensions not available yet. Retrying...");
            requestAnimationFrame(detectFrame);
            return;
          }

          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
          const imageData = canvas.toDataURL('image/jpeg').split(',')[1];
          
          console.log("Sending image data for detection...");
          const detectedObjects = await detectObjects(imageData, settings.detectionThreshold);
          console.log("Detected objects:", detectedObjects);
          updateCounts(detectedObjects);
          setError(null);

          await new Promise(resolve => setTimeout(resolve, settings.updateInterval));
          
          if (isDetecting) {
            requestAnimationFrame(detectFrame);
          }
        } catch (error) {
          console.error("Detection error:", error);
          setError(`Detection error: ${error.message}`);
          setIsDetecting(false);
          stopCamera();
          toast({
            variant: "destructive",
            title: "Detection Error",
            description: `An error occurred during object detection: ${error.message}`,
          });
        }
      }
    };

    detectFrame().catch(error => {
      console.error("Unhandled error in detectFrame:", error);
      setError(`Unhandled error: ${error.message}`);
      setIsDetecting(false);
      stopCamera();
      toast({
        variant: "destructive",
        title: "Unhandled Error",
        description: `An unexpected error occurred: ${error.message}`,
      });
    });
  };

  const stopDetection = () => {
    // The detection will stop automatically when isDetecting becomes false
  };

  const updateCounts = (detectedObjects) => {
    setCounts(prevCounts => {
      const newCounts = { ...prevCounts };
      detectedObjects.forEach(obj => {
        const className = obj.class.toLowerCase();
        if (newCounts.hasOwnProperty(className)) {
          newCounts[className]++;
        } else {
          console.warn(`Unknown object class detected: ${obj.class}`);
        }
      });
      console.log("Updated counts:", newCounts);
      return newCounts;
    });
  };

  const chartData = Object.entries(counts).map(([name, count]) => ({ name, count }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center text-green-800">Recycling Object Counter</h1>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Live Feed</CardTitle>
        </CardHeader>
        <CardContent className="h-64 bg-gray-200 flex flex-col items-center justify-center relative">
          {isDetecting ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <Camera className="h-16 w-16 text-gray-400 mb-2" />
              <p className="text-gray-500">Camera feed will appear here when detection starts</p>
            </div>
          )}
          <div className="mt-4">
            <Button onClick={toggleDetection} className="w-32">
              {isDetecting ? <><Square className="mr-2 h-4 w-4" /> Stop</> : <><Play className="mr-2 h-4 w-4" /> Start</>}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(counts).map(([key, value]) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-center">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center space-x-4">
        <Button variant="outline" className="w-32">
          <Settings className="mr-2 h-4 w-4" /> Settings
        </Button>
        <Button variant="outline" className="w-32">
          <History className="mr-2 h-4 w-4" /> History
        </Button>
        <Button variant="outline" className="w-32">
          <Info className="mr-2 h-4 w-4" /> Help
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Object Count Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{top: 5, right: 30, left: 20, bottom: 5}}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis width={40} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No data available for visualization</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
