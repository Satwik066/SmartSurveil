import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatsCards from "@/components/dashboard/StatsCards";
import CameraGrid from "@/components/dashboard/CameraGrid";
import IntrusionLogs from "@/components/dashboard/IntrusionLogs";
import { useToast } from "@/hooks/use-toast";

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

export interface Camera {
  id: number;
  name: string;
  stream_url: string;
  status: string;
  roi_x?: number;
  roi_y?: number;
  roi_width?: number;
  roi_height?: number;
}

export interface IntrusionLog {
  id: number;
  camera_id: number;
  camera_name: string;
  timestamp: string;
  confidence: number;
  image_path?: string;
}

const Dashboard = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [logs, setLogs] = useState<IntrusionLog[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    loadCameras();
    loadLogs();
    connectWebSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const connectWebSocket = () => {
    const newSocket = io(SOCKET_URL);
    
    newSocket.on('connect', () => {
      console.log('WebSocket connected');
    });

    newSocket.on('intrusion_detected', (data) => {
      toast({
        title: "Intrusion Detected!",
        description: `Camera: ${data.camera_name} - Confidence: ${(data.confidence * 100).toFixed(1)}%`,
        variant: "destructive",
      });
      loadLogs();
    });

    setSocket(newSocket);
  };

  const loadCameras = async () => {
    try {
      const response = await fetch(`${API_URL}/cameras`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCameras(data.cameras);
      }
    } catch (error) {
      console.error('Failed to load cameras:', error);
    }
  };

  const loadLogs = async () => {
    try {
      const response = await fetch(`${API_URL}/logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (socket) {
      socket.disconnect();
    }
    navigate('/');
  };

  const handleNavigate = (section: string) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <DashboardLayout user={user} onLogout={handleLogout} onNavigate={handleNavigate}>
      <div className="space-y-6">
        <div id="dashboard">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your security cameras and intrusion events
          </p>
        </div>
        
        <div id="analytics">
          <StatsCards cameras={cameras} logs={logs} />
        </div>
        
        <div id="cameras">
          <CameraGrid cameras={cameras} socket={socket} onRefresh={loadCameras} />
        </div>
        
        <div id="logs">
          <IntrusionLogs logs={logs} onRefresh={loadLogs} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
