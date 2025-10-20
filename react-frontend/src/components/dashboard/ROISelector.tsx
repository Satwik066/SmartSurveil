import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera } from "@/pages/Dashboard";
import { useToast } from "@/hooks/use-toast";

const API_URL = 'http://localhost:5000/api';

interface ROISelectorProps {
  camera: Camera | null;
  frame: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Point {
  x: number;
  y: number;
}

const ROISelector = ({ camera, frame, open, onOpenChange, onSuccess }: ROISelectorProps) => {
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [endPoint, setEndPoint] = useState<Point | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (open && frame && canvasRef.current && imageRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imageRef.current;

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        // Draw existing ROI if available
        if (camera?.roi_x !== undefined && camera?.roi_width) {
          ctx!.strokeStyle = 'lime';
          ctx!.lineWidth = 2;
          ctx!.strokeRect(
            camera.roi_x,
            camera.roi_y || 0,
            camera.roi_width,
            camera.roi_height || 0
          );
        }
      };
    }
  }, [open, frame, camera]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    setStartPoint(pos);
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;
    
    const pos = getMousePos(e);
    setEndPoint(pos);
    
    // Redraw canvas
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;
    
    if (ctx && img && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      // Draw current selection
      ctx.strokeStyle = 'lime';
      ctx.lineWidth = 2;
      const width = pos.x - startPoint.x;
      const height = pos.y - startPoint.y;
      ctx.strokeRect(startPoint.x, startPoint.y, width, height);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const pos = getMousePos(e);
    setEndPoint(pos);
    setIsDrawing(false);
  };

  const handleSaveROI = async () => {
    if (!camera || !startPoint || !endPoint) {
      toast({
        title: "Error",
        description: "Please draw a region of interest first",
        variant: "destructive",
      });
      return;
    }

    const x = Math.min(startPoint.x, endPoint.x);
    const y = Math.min(startPoint.y, endPoint.y);
    const width = Math.abs(endPoint.x - startPoint.x);
    const height = Math.abs(endPoint.y - startPoint.y);

    try {
      const response = await fetch(`${API_URL}/cameras/${camera.id}/roi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          x: Math.round(x),
          y: Math.round(y),
          width: Math.round(width),
          height: Math.round(height)
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Region of interest updated successfully",
        });
        onSuccess();
        onOpenChange(false);
      } else {
        throw new Error('Failed to update ROI');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update region of interest",
        variant: "destructive",
      });
    }
  };

  const handleClearROI = async () => {
    if (!camera) return;

    try {
      // Clear ROI by setting it to full frame (0,0,0,0)
      const response = await fetch(`${API_URL}/cameras/${camera.id}/roi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          x: 0,
          y: 0,
          width: 0,
          height: 0
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Region of interest cleared",
        });
        setStartPoint(null);
        setEndPoint(null);
        
        // Redraw canvas without ROI
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const img = imageRef.current;
        if (ctx && img && canvas) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        }
        
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear region of interest",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select Region of Interest</DialogTitle>
          <DialogDescription>
            Draw a rectangle on the camera feed to define the monitoring area. Only intrusions within this area will be detected.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative border rounded-lg overflow-hidden bg-muted">
            {frame ? (
              <>
                <img
                  ref={imageRef}
                  src={`data:image/jpeg;base64,${frame}`}
                  alt={camera?.name}
                  className="hidden"
                />
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto cursor-crosshair"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No camera feed available
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleClearROI}
            >
              Clear ROI
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveROI}
              className="gradient-primary"
            >
              Save ROI
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ROISelector;
