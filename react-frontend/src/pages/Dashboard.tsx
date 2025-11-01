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
  url: string;                  // backend returns `url`
  is_active?: boolean;          // maps to backend `is_active`
  detection_enabled?: boolean;  // maps to backend `detection_enabled`
  roi_x?: number;
  roi_y?: number;
  roi_width?: number;
  roi_height?: number;
  confidence_threshold?: number; // 0.0-1.0 range
  alert_interval?: number;       // seconds between alerts
}

export interface IntrusionLog {
  id: number;
  camera_id: number;
  camera_name: string;
  timestamp: string;
  detection_count: number;
  image_path?: string;
}

const Dashboard = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [logs, setLogs] = useState<IntrusionLog[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const token = localStorage.getItem('token');
  
  // Safely parse user data
  let user = { username: 'User', email: '' };
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      user = JSON.parse(userData);
    }
  } catch (error) {
    console.error('Failed to parse user data:', error);
  }

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    loadCameras();
    loadLogs();
    const newSocket = connectWebSocket();

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [token, navigate]);

  const connectWebSocket = () => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });
    
    newSocket.on('connect', () => {
      console.log('WebSocket connected, ID:', newSocket.id);
      // Reload cameras to trigger frame streaming
      loadCameras();
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    newSocket.on('intrusion_detected', (data) => {
      console.log('Intrusion detected event received:', data);
      toast({
        title: "Intrusion Detected!",
        description: `Camera: ${data.camera_name} - ${data.person_count} person(s) detected`,
        variant: "destructive",
      });
      loadLogs();
    });

    setSocket(newSocket);
    return newSocket;
  };

  const loadCameras = async () => {
    try {
      const response = await fetch(`${API_URL}/cameras`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCameras(data.cameras);
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to load cameras:', error);
      toast({
        title: "Error",
        description: "Failed to load cameras. Please refresh the page.",
        variant: "destructive",
      });
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
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
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
