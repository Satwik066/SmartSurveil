import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import { Plus, Play, Pause, Maximize2, Settings as SettingsIcon, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera } from "@/pages/Dashboard";
import AddCameraDialog from "./AddCameraDialog";
import CameraSettings from "./CameraSettings";
import FullscreenCamera from "./FullscreenCamera";
import { useToast } from "@/hooks/use-toast";

const API_URL = 'http://localhost:5000/api';

interface CameraGridProps {
  cameras: Camera[];
  socket: Socket | null;
  onRefresh: () => void;
}

const CameraGrid = ({ cameras, socket, onRefresh }: CameraGridProps) => {
  const [frames, setFrames] = useState<Record<number, string>>({});
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [fullscreenCamera, setFullscreenCamera] = useState<Camera | null>(null);
  const [settingsCamera, setSettingsCamera] = useState<Camera | null>(null);
  const [pausedCameras, setPausedCameras] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const token = localStorage.getItem('token');

  // Initialize pausedCameras from database state
  useEffect(() => {
    const paused = new Set<number>();
    cameras.forEach(camera => {
      if (!camera.detection_enabled) {
        paused.add(camera.id);
      }
    });
    setPausedCameras(paused);
  }, [cameras]);

  useEffect(() => {
    if (!socket) return;

    cameras.forEach(camera => {
      socket.emit('start_camera', { camera_id: camera.id });
      
      socket.on(`camera_frame_${camera.id}`, (data: { frame: string }) => {
        setFrames(prev => ({ ...prev, [camera.id]: data.frame }));
      });
    });

    return () => {
      cameras.forEach(camera => {
        socket.off(`camera_frame_${camera.id}`);
      });
    };
  }, [socket, cameras]);

  const handleDeleteCamera = async (cameraId: number) => {
    if (!confirm('Are you sure you want to delete this camera? This will also delete all associated intrusion logs.')) return;

    try {
      const response = await fetch(`${API_URL}/cameras/${cameraId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast({
          title: "Camera deleted",
          description: "Camera and associated logs removed successfully",
        });
        onRefresh();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete camera');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete camera",
        variant: "destructive",
      });
    }
  };

  const handleToggleDetection = async (cameraId: number) => {
    const isPaused = pausedCameras.has(cameraId);
    
    try {
      const response = await fetch(`${API_URL}/cameras/${cameraId}/detection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          enabled: isPaused // If paused (true), enable it (true); if enabled (false), pause it (false)
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle detection (${response.status})`);
      }

      const newPausedCameras = new Set(pausedCameras);
      if (isPaused) {
        newPausedCameras.delete(cameraId);
      } else {
        newPausedCameras.add(cameraId);
      }
      setPausedCameras(newPausedCameras);
      
      toast({
        title: isPaused ? "Detection Resumed" : "Detection Paused",
        description: `Intrusion detection ${isPaused ? 'enabled' : 'disabled'} for this camera`,
      });
    } catch (error) {
      console.error('Error toggling detection:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to toggle detection",
        variant: "destructive",
      });
    }
  };

  const handleFullscreen = (camera: Camera) => {
    setFullscreenCamera(camera);
  };

  const handleSettings = (camera: Camera) => {
    setSettingsCamera(camera);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Camera Feeds</h2>
          <p className="text-muted-foreground text-sm">
            Live monitoring from all connected cameras
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} className="gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Camera
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cameras.map((camera) => {
          const statusLabel = pausedCameras.has(camera.id)
            ? 'paused'
            : (camera.is_active ? 'online' : 'offline');

          return (
          <Card key={camera.id} className="overflow-hidden hover-lift">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{camera.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={pausedCameras.has(camera.id) ? 'secondary' : 'default'}>
                    {statusLabel}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleToggleDetection(camera.id)}
                    title={pausedCameras.has(camera.id) ? "Resume detection" : "Pause detection"}
                  >
                    {pausedCameras.has(camera.id) ? (
                      <Play className="h-4 w-4 text-green-500" />
                    ) : (
                      <Pause className="h-4 w-4 text-orange-500" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                {frames[camera.id] ? (
                  <>
                    <img
                      src={`data:image/jpeg;base64,${frames[camera.id]}`}
                      alt={camera.name}
                      className="w-full h-full object-cover"
                    />
                    {pausedCameras.has(camera.id) && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="gap-1">
                          <Pause className="h-3 w-3" />
                          Detection Paused
                        </Badge>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <Play className="h-8 w-8" />
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleFullscreen(camera)}
                  title="Fullscreen"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleSettings(camera)}
                  title="Set ROI"
                >
                  <SettingsIcon className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-destructive hover:text-destructive"
                  onClick={() => handleDeleteCamera(camera.id)}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
      </div>

      <AddCameraDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen}
        onSuccess={onRefresh}
      />

      <FullscreenCamera
        camera={fullscreenCamera}
        frame={fullscreenCamera ? frames[fullscreenCamera.id] : null}
        open={!!fullscreenCamera}
        onOpenChange={(open) => !open && setFullscreenCamera(null)}
      />

      <CameraSettings
        camera={settingsCamera}
        frame={settingsCamera ? frames[settingsCamera.id] : null}
        open={!!settingsCamera}
        onOpenChange={(open) => !open && setSettingsCamera(null)}
        onSuccess={onRefresh}
      />
    </div>
  );
};

export default CameraGrid;
