import { AlertTriangle, Calendar, Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IntrusionLog } from "@/pages/Dashboard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface IntrusionLogsProps {
  logs: IntrusionLog[];
  onRefresh: () => void;
}

const IntrusionLogs = ({ logs }: IntrusionLogsProps) => {
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(date);
  };

  const getSeverityBadge = (count: number) => {
    if (count >= 3) return <Badge className="bg-red-500">High Alert</Badge>;
    if (count >= 2) return <Badge className="bg-orange-500">Medium</Badge>;
    return <Badge className="bg-yellow-500">Low</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Intrusion Logs</CardTitle>
            <p className="text-muted-foreground text-sm">
              Recent detection events from all cameras
            </p>
          </div>
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No intrusion events detected</p>
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Camera</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Persons Detected</TableHead>
                  <TableHead>Severity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.slice(0, 10).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Camera className="h-4 w-4 text-muted-foreground" />
                        {log.camera_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(log.timestamp)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {log.detection_count} {log.detection_count === 1 ? 'person' : 'persons'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getSeverityBadge(log.detection_count)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IntrusionLogs;
