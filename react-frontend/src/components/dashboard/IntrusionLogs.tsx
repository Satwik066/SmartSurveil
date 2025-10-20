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
    return date.toLocaleString();
  };

  const getConfidenceBadge = (confidence: number) => {
    const percent = confidence * 100;
    if (percent >= 80) return <Badge className="bg-red-500">High</Badge>;
    if (percent >= 60) return <Badge className="bg-orange-500">Medium</Badge>;
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
                  <TableHead>Confidence</TableHead>
                  <TableHead>Status</TableHead>
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
                        <div className="w-full max-w-[100px] bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${log.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-sm">{(log.confidence * 100).toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getConfidenceBadge(log.confidence)}
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
