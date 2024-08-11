import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square, Settings, History, Info, AlertCircle, Camera } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { detectObjects } from '../utils/objectDetection';
import { saveCountsToLocalStorage, getCountsFromLocalStorage } from '../utils/localStorage';

const Index = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [counts, setCounts] = useState(getCountsFromLocalStorage());
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => console.log('Service Worker registered with scope:', registration.scope))
        .catch(error => console.error('Service Worker registration failed:', error));
    }
  }, []);

  useEffect(() => {
    saveCountsToLocalStorage(counts);
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
    const worker = new Worker(new URL('../workers/detectionWorker.js', import.meta.url));
    worker.onmessage = (event) => {
      if (event.data.error) {
        setError(event.data.error);
        setIsDetecting(false);
        stopCamera();
      } else {
        const detectedObjects = event.data;
        updateCounts(detectedObjects);
        setError(null);
      }
    };

    const detectFrame = () => {
      if (videoRef.current && isDetecting) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg').split(',')[1];
        worker.postMessage({ image: imageData });
        requestAnimationFrame(detectFrame);
      }
    };

    requestAnimationFrame(detectFrame);
  };

  const stopDetection = () => {
    // The detection will stop automatically when isDetecting becomes false
  };

  const updateCounts = (detectedObjects) => {
    setCounts(prevCounts => {
      const newCounts = { ...prevCounts };
      detectedObjects.forEach(obj => {
        if (newCounts.hasOwnProperty(obj.class)) {
          newCounts[obj.class]++;
        }
      });
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
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{top: 5, right: 30, left: 20, bottom: 5}}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
