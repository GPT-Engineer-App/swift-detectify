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
    updateSettings({
      ...settings,
      [e.target.name]: parseFloat(e.target.value),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings(settings);
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
            <Button type="submit">Save Settings</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
