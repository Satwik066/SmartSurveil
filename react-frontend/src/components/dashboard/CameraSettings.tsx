import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera } from "@/pages/Dashboard";
import { useToast } from "@/hooks/use-toast";
import ROISelectorContent from "./ROISelectorContent";
import { Settings2, Video, Target } from "lucide-react";

const API_URL = 'http://localhost:5000/api';

interface CameraSettingsProps {
  camera: Camera | null;
  frame: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CameraSettings = ({ camera, frame, open, onOpenChange, onSuccess }: CameraSettingsProps) => {
  const [activeTab, setActiveTab] = useState("general");
  const [cameraName, setCameraName] = useState(camera?.name || "");
  const [streamUrl, setStreamUrl] = useState("");
  const [confidenceThreshold, setConfidenceThreshold] = useState(50);
  const [alertInterval, setAlertInterval] = useState(30);
  const { toast } = useToast();
  const token = localStorage.getItem('token');

  const handleUpdateCamera = async () => {
    if (!camera) return;

    try {
      const response = await fetch(`${API_URL}/cameras/${camera.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: cameraName,
          url: streamUrl || camera.url
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Camera settings updated successfully",
        });
        onSuccess();
      } else {
        throw new Error('Failed to update camera');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update camera settings",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAdvancedSettings = async () => {
    if (!camera) return;

    try {
      // Convert confidence from 0-100 to 0.0-1.0 for backend
      const confidenceValue = confidenceThreshold / 100;

      const response = await fetch(`${API_URL}/cameras/${camera.id}/advanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          confidence_threshold: confidenceValue,
          alert_interval: alertInterval
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Advanced settings updated successfully",
        });
        onSuccess();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update advanced settings');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update advanced settings",
        variant: "destructive",
      });
    }
  };

  // Initialize form when camera changes
  useEffect(() => {
    if (camera) {
      setCameraName(camera.name);
      setStreamUrl(camera.url);
      // Convert confidence from 0.0-1.0 to 0-100 for display
      setConfidenceThreshold(Math.round((camera.confidence_threshold || 0.5) * 100));
      setAlertInterval(camera.alert_interval || 30);
    }
  }, [camera]);

  if (!camera) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Camera Settings - {camera.name}
          </DialogTitle>
          <DialogDescription>
            Configure camera settings, detection zones, and monitoring preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="roi" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Detection Zone
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="camera-name">Camera Name</Label>
                <Input
                  id="camera-name"
                  value={cameraName}
                  onChange={(e) => setCameraName(e.target.value)}
                  placeholder="Enter camera name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stream-url">Stream URL</Label>
                <Input
                  id="stream-url"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  placeholder="rtsp://... or 0 for webcam"
                />
                <p className="text-sm text-muted-foreground">
                  Examples: 0 (webcam), rtsp://user:pass@192.168.1.100:554/stream
                </p>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${camera.is_active ? 'bg-green-500' : 'bg-gray-500'}`} />
                  <span className="text-sm capitalize">{camera.is_active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateCamera} className="gradient-primary">
                  Save Changes
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="roi" className="mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Region of Interest (ROI)</h4>
                <p className="text-sm text-muted-foreground">
                  Draw a rectangle on the camera feed to define the monitoring area. 
                  Only intrusions within this area will trigger alerts.
                </p>
              </div>
              
              <ROISelectorContent
                camera={camera}
                frame={frame}
                onSuccess={onSuccess}
              />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-muted/50">
                <h4 className="font-medium mb-2">Detection Settings</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Advanced detection and alert configuration
                </p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="confidence-threshold">Confidence Threshold: {confidenceThreshold}%</Label>
                    <Input 
                      id="confidence-threshold"
                      type="range" 
                      min="0" 
                      max="100" 
                      value={confidenceThreshold}
                      onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum confidence level for person detection. Higher values reduce false positives.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alert-interval">Alert Interval (seconds)</Label>
                    <Input 
                      id="alert-interval"
                      type="number" 
                      min="0" 
                      value={alertInterval}
                      onChange={(e) => setAlertInterval(Number(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum seconds between alerts for the same camera to prevent spam.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Recording</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatic recording on detection (Coming soon)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateAdvancedSettings} className="gradient-primary">
                  Save Settings
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CameraSettings;
