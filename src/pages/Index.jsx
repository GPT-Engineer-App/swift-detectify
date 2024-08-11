import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square, Settings, History, Info, AlertCircle, Camera } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [counts, setCounts] = useState({
    glass: 0,
    can: 0,
    pet1: 0,
    hdpe2: 0,
    carton: 0
  });
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const { toast } = useToast();

  const updateCounts = useCallback(() => {
    // In a real application, this would be replaced with actual object detection logic
    try {
      setCounts(prevCounts => ({
        glass: prevCounts.glass + Math.floor(Math.random() * 2),
        can: prevCounts.can + Math.floor(Math.random() * 2),
        pet1: prevCounts.pet1 + Math.floor(Math.random() * 2),
        hdpe2: prevCounts.hdpe2 + Math.floor(Math.random() * 2),
        carton: prevCounts.carton + Math.floor(Math.random() * 2)
      }));
      setError(null);
    } catch (err) {
      setError("Failed to update object counts. Please try again.");
      setIsDetecting(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update object counts. Please try again.",
      });
    }
  }, [toast]);

  const startCamera = useCallback(async () => {
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
  }, [toast]);

  useEffect(() => {
    let interval;
    if (isDetecting) {
      startCamera();
      interval = setInterval(updateCounts, 2000);
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    }
    return () => {
      clearInterval(interval);
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [isDetecting, updateCounts, startCamera]);

  const toggleDetection = () => {
    setIsDetecting(prev => !prev);
    if (!isDetecting) {
      toast({
        title: "Detection Started",
        description: "The system is now detecting and counting objects.",
      });
    } else {
      toast({
        title: "Detection Stopped",
        description: "Object detection has been stopped.",
      });
    }
  };

  const chartData = [
    { name: 'Glass', count: counts.glass },
    { name: 'Can', count: counts.can },
    { name: 'PET 1', count: counts.pet1 },
    { name: 'HDPE 2', count: counts.hdpe2 },
    { name: 'Carton', count: counts.carton },
  ];

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Live Feed</CardTitle>
          </CardHeader>
          <CardContent className="h-64 bg-gray-200 flex items-center justify-center relative">
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
          </CardContent>
        </Card>
        
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
        <Button onClick={toggleDetection} className="w-32">
          {isDetecting ? <><Square className="mr-2 h-4 w-4" /> Stop</> : <><Play className="mr-2 h-4 w-4" /> Start</>}
        </Button>
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
