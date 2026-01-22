import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Bug } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminBugMessages() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [bugReports, setBugReports] = useState<any[]>([]);
  const [updatingReport, setUpdatingReport] = useState<number | null>(null);
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
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {bugReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No bug reports yet
                </div>
              ) : (
                bugReports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            report.type === 'bug'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {report.type === 'bug' ? 'Bug Report' : 'Feature Request'}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            report.status === 'open' ? 'bg-green-100 text-green-800' :
                            report.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            report.status === 'resolved' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {report.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          From: {report.userName} ({report.userEmail})
                        </p>
                        <p className="text-sm">{report.message}</p>
                        {report.admin_response && (
                          <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                            <p className="text-sm font-medium text-blue-800 mb-1">Admin Response:</p>
                            <p className="text-sm text-blue-700">{report.admin_response}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Select
                        value={report.status}
                        onValueChange={(value) => handleUpdateBugReport(report.id, value, report.admin_response || '')}
                        disabled={updatingReport === report.id}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Textarea
                        placeholder="Add admin response..."
                        value={report.admin_response || ''}
                        onChange={(e) => {
                          const updatedReports = bugReports.map(r =>
                            r.id === report.id ? { ...r, admin_response: e.target.value } : r
                          );
                          setBugReports(updatedReports);
                        }}
                        className="flex-1"
                        disabled={updatingReport === report.id}
                      />
                      <Button
                        onClick={() => handleUpdateBugReport(report.id, report.status, report.admin_response || '')}
                        disabled={updatingReport === report.id}
                        size="sm"
                      >
                        {updatingReport === report.id ? 'Updating...' : 'Update'}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}