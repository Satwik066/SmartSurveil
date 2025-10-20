import { Camera, AlertTriangle, CheckCircle, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera as CameraType, IntrusionLog } from "@/pages/Dashboard";

interface StatsCardsProps {
  cameras: CameraType[];
  logs: IntrusionLog[];
}

const StatsCards = ({ cameras, logs }: StatsCardsProps) => {
  const activeCameras = cameras.filter(c => c.status === 'active').length;
  const todayLogs = logs.filter(log => {
    const logDate = new Date(log.timestamp);
    const today = new Date();
    return logDate.toDateString() === today.toDateString();
  }).length;

  const stats = [
    {
      title: "Total Cameras",
      value: cameras.length,
      icon: Camera,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Active Cameras",
      value: activeCameras,
      icon: CheckCircle,
      gradient: "from-green-500 to-green-600",
    },
    {
      title: "Today's Detections",
      value: todayLogs,
      icon: AlertTriangle,
      gradient: "from-red-500 to-red-600",
    },
    {
      title: "Total Detections",
      value: logs.length,
      icon: Activity,
      gradient: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
              <stat.icon className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
