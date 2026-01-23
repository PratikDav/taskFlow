import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bug, MessageSquare, User, Calendar, CheckCircle, Clock, AlertTriangle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminBugMessages() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [bugReports, setBugReports] = useState<any[]>([]);
  const [updatingReport, setUpdatingReport] = useState<number | null>(null);
  const [localChanges, setLocalChanges] = useState<{[key: number]: {status: string, admin_response: string}}>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        const user = await res.json();
        if (!user || user.role !== "admin") {
          setLocation("/login");
          return;
        }
        setCurrentUser(user);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setLocation("/login");
      }
    };
    fetchUser();
  }, [setLocation]);

  useEffect(() => {
    if (currentUser) {
      loadBugReports();
    }
  }, [currentUser]);

  const loadBugReports = async () => {
    try {
      const res = await fetch("/api/admin/bug-reports", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setBugReports(data);
        setLocalChanges({}); // Clear local changes when reloading
      } else {
        console.error("Failed to load bug reports");
      }
    } catch (err) {
      console.error("Error loading bug reports:", err);
    }
  };

  const handleUpdateBugReport = async (reportId: number, status: string, adminResponse: string) => {
    setUpdatingReport(reportId);
    try {
      const res = await fetch(`/api/admin/bug-reports/${reportId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status,
          admin_response: adminResponse,
        }),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Bug report updated successfully.",
        });
        loadBugReports(); // Reload bug reports
        // Local changes will be cleared by loadBugReports
      } else {
        toast({
          title: "Error",
          description: "Failed to update bug report.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error updating bug report:", err);
      toast({
        title: "Error",
        description: "Failed to update bug report.",
        variant: "destructive",
      });
    } finally {
      setUpdatingReport(null);
    }
  };

  const handleDeleteBugReport = async (reportId: number) => {
    if (!confirm('Are you sure you want to delete this resolved bug report? This action cannot be undone.')) {
      return;
    }

    setUpdatingReport(reportId);
    try {
      const res = await fetch(`/api/admin/bug-reports/${reportId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Bug report deleted successfully.",
        });
        loadBugReports(); // Reload bug reports
      } else {
        toast({
          title: "Error",
          description: "Failed to delete bug report.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error deleting bug report:", err);
      toast({
        title: "Error",
        description: "Failed to delete bug report.",
        variant: "destructive",
      });
    } finally {
      setUpdatingReport(null);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Bug Messages</h1>
          <p className="text-slate-600">Manage user-submitted bug reports and feature requests</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              All Reports
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              View and manage user-submitted bug reports and feature requests.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-y-auto">
              {bugReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bug className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No Bug Reports Yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    When users submit bug reports or feature requests, they'll appear here for you to review and manage.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {bugReports.map((report) => (
                    <div key={report.id} className="p-6 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <Badge
                                variant={report.type === 'bug' ? 'destructive' : 'secondary'}
                                className="flex items-center gap-1"
                              >
                                {report.type === 'bug' ? (
                                  <AlertTriangle className="h-3 w-3" />
                                ) : (
                                  <MessageSquare className="h-3 w-3" />
                                )}
                                {report.type === 'bug' ? 'Bug Report' : 'Feature Request'}
                              </Badge>
                              <Badge
                                variant={
                                  report.status === 'open' ? 'default' :
                                  report.status === 'in_progress' ? 'secondary' :
                                  report.status === 'resolved' ? 'outline' :
                                  'destructive'
                                }
                                className="flex items-center gap-1"
                              >
                                {report.status === 'open' && <Clock className="h-3 w-3" />}
                                {report.status === 'in_progress' && <AlertTriangle className="h-3 w-3" />}
                                {report.status === 'resolved' && <CheckCircle className="h-3 w-3" />}
                                {report.status === 'closed' && <XCircle className="h-3 w-3" />}
                                {report.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(report.created_at || Date.now()).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-sm">{report.userName}</span>
                              <span className="text-xs text-muted-foreground">({report.userEmail})</span>
                            </div>
                            <p className="text-sm text-foreground leading-relaxed">{report.message}</p>
                          </div>

                          {report.admin_response && report.admin_response.length > 0 && (
                            <div className="mb-4 space-y-3">
                              <div className="font-medium text-sm text-muted-foreground">Admin Responses</div>
                              {report.admin_response.map((response: any, index: number) => (
                                <Alert key={index} className="border-l-4 border-l-primary">
                                  <MessageSquare className="h-4 w-4" />
                                  <AlertDescription>
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="font-medium text-sm">Admin Response #{index + 1}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {new Date(response.timestamp).toLocaleString()}
                                      </div>
                                    </div>
                                    <p className="text-sm">{response.message}</p>
                                  </AlertDescription>
                                </Alert>
                              ))}
                            </div>
                          )}

                          <Separator className="my-4" />

                          <div className="flex items-end gap-3">
                            <div className="flex-1">
                              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                                Update Status
                              </label>
                              <Select
                                value={localChanges[report.id]?.status || report.status}
                                onValueChange={(value) => {
                                  setLocalChanges(prev => ({
                                    ...prev,
                                    [report.id]: {
                                      ...prev[report.id],
                                      status: value,
                                      admin_response: prev[report.id]?.admin_response || report.admin_response || ''
                                    }
                                  }));
                                }}
                                disabled={updatingReport === report.id}
                              >
                                <SelectTrigger className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-2 border-gray-200 shadow-lg rounded-lg">
                                  <SelectItem value="open" className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer">Open</SelectItem>
                                  <SelectItem value="in_progress" className="hover:bg-yellow-50 focus:bg-yellow-50 cursor-pointer">In Progress</SelectItem>
                                  <SelectItem value="resolved" className="hover:bg-green-50 focus:bg-green-50 cursor-pointer">Resolved</SelectItem>
                                  <SelectItem value="closed" className="hover:bg-gray-50 focus:bg-gray-50 cursor-pointer">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex-1">
                              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                                Add New Admin Response
                              </label>
                              <Textarea
                                placeholder="Add your response..."
                                value={localChanges[report.id]?.admin_response || ''}
                                onChange={(e) => {
                                  setLocalChanges(prev => ({
                                    ...prev,
                                    [report.id]: {
                                      ...prev[report.id],
                                      status: prev[report.id]?.status || report.status,
                                      admin_response: e.target.value
                                    }
                                  }));
                                }}
                                className="min-h-[80px] resize-none"
                                disabled={updatingReport === report.id}
                              />
                            </div>
                            <div className="flex gap-2 self-end">
                              <Button
                                onClick={() => {
                                  const changes = localChanges[report.id];
                                  const newStatus = changes?.status || report.status;
                                  const newResponse = changes?.admin_response || '';
                                  
                                  handleUpdateBugReport(report.id, newStatus, newResponse);
                                }}
                                disabled={updatingReport === report.id}
                              >
                                {updatingReport === report.id ? 'Updating...' : 'Update'}
                              </Button>
                              {report.status === 'resolved' && (
                                <Button
                                  variant="destructive"
                                  onClick={() => handleDeleteBugReport(report.id)}
                                  disabled={updatingReport === report.id}
                                >
                                  Delete
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}