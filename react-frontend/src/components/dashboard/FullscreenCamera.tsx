import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Camera } from "@/pages/Dashboard";

interface FullscreenCameraProps {
  camera: Camera | null;
  frame: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FullscreenCamera = ({ camera, frame, open, onOpenChange }: FullscreenCameraProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-2">
        <div className="relative w-full h-full rounded-lg overflow-hidden bg-muted">
          {frame ? (
            <img
              src={`data:image/jpeg;base64,${frame}`}
              alt={camera?.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No camera feed available
            </div>
          )}
          
          {camera && (
            <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg">
              <h3 className="font-semibold">{camera.name}</h3>
              <p className="text-sm text-muted-foreground">{camera?.url}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FullscreenCamera;
