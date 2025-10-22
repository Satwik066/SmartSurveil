import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const API_URL = 'http://localhost:5000/api';

interface AddCameraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AddCameraDialog = ({ open, onOpenChange, onSuccess }: AddCameraDialogProps) => {
  const [name, setName] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const token = localStorage.getItem('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/cameras`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({name: name, url: streamUrl })
      });

      if (response.ok) {
        toast({
          title: "Camera added",
          description: "New camera has been added successfully",
        });
        setName("");
        setStreamUrl("");
        onOpenChange(false);
        onSuccess();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Failed to add camera",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Camera</DialogTitle>
          <DialogDescription>
            Configure a new security camera for monitoring
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Camera Name</Label>
            <Input
              id="name"
              placeholder="e.g., Front Door"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="streamUrl">Stream URL</Label>
            <Input
              id="streamUrl"
              placeholder="rtsp://... or http://... or camera index (0, 1, etc.)"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter RTSP/HTTP URL or camera index for local cameras
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="gradient-primary" disabled={loading}>
              {loading ? "Adding..." : "Add Camera"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCameraDialog;
