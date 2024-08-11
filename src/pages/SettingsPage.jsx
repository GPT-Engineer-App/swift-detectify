import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSettings } from '../hooks/useSettings';
import { useToast } from "@/components/ui/use-toast";

const SettingsPage = () => {
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    updateSettings({
      ...settings,
      [e.target.name]: value,
    });
  };

  const handleFileChange = (e, fileType) => {
    const files = e.target.files;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        updateSettings({
          ...settings,
          [fileType]: {
            name: file.name,
            content: event.target.result,
          },
        });
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedSettings = {
      ...settings,
      detectionThreshold: parseFloat(settings.detectionThreshold),
      updateInterval: parseInt(settings.updateInterval, 10),
    };
    updateSettings(updatedSettings);
    toast({
      title: "Settings Updated",
      description: "Your settings have been saved successfully.",
    });
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
            <div className="mb-4">
              <Label htmlFor="modelFile">Model File</Label>
              <Input
                id="modelFile"
                name="modelFile"
                type="file"
                onChange={(e) => handleFileChange(e, 'modelFile')}
                accept=".pt"
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
