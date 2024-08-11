import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    detectionThreshold: 0.7,
    updateInterval: 2000,
  });

  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically save the settings to a backend or local storage
    console.log('Settings saved:', settings);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="detectionThreshold">Detection Threshold</Label>
              <Input
                id="detectionThreshold"
                name="detectionThreshold"
                type="number"
                value={settings.detectionThreshold}
                onChange={handleChange}
                min="0"
                max="1"
                step="0.1"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="updateInterval">Update Interval (ms)</Label>
              <Input
                id="updateInterval"
                name="updateInterval"
                type="number"
                value={settings.updateInterval}
                onChange={handleChange}
                min="500"
                step="500"
              />
            </div>
            <Button type="submit">Save Settings</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
