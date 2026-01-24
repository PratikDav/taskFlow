import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { capitalizeFirstLetter } from "@/lib/utils";
import { useTranslation } from "@/lib/LanguageContext";

function BugReportCard({ report, onStatusUpdate }: { report: any; onStatusUpdate: () => void }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState(report.status);
  const [responses, setResponses] = useState<any[]>([]);
  const [newResponse, setNewResponse] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch(`/api/admin/bug-reports/${report.id}`)
        .then(res => res.json())
        .then(data => setResponses(data.responses || []));
    }
  }, [isOpen, report.id]);

  // When updating status: if there's a message written, send it as a response too.
  const handleStatusChange = async (newStatus: string) => {
    try {
      if (newResponse && newResponse.trim()) {
        // send response first
        await fetch(`/api/admin/bug-reports/${report.id}/responses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: newResponse }),
        });
        setNewResponse("");
      }
      // update status
      await fetch(`/api/admin/bug-reports/${report.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setStatus(newStatus);
      onStatusUpdate();
      // refresh responses if open
      if (isOpen) {
        const res = await fetch(`/api/admin/bug-reports/${report.id}`);
        const data = await res.json();
        setResponses(data.responses || []);
      }
    } catch (err) {
      console.error(err);
      alert(t('failedToUpdateStatus'));
    }
  };

  const handleAddResponse = async () => {
    if (!newResponse.trim()) return;
    try {
      await fetch(`/api/admin/bug-reports/${report.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newResponse }),
      });
      setNewResponse("");
      // Reload responses
      const res = await fetch(`/api/admin/bug-reports/${report.id}`);
      const data = await res.json();
      setResponses(data.responses || []);
      onStatusUpdate();
    } catch (err) {
      console.error(err);
      alert(t('failedToAddResponse'));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">{report.title}</h3>
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                report.type === "bug" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
              }`}>
                {capitalizeFirstLetter(report.type)}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                status === "open" ? "bg-yellow-100 text-yellow-800" :
                status === "in_progress" ? "bg-blue-100 text-blue-800" :
                status === "resolved" ? "bg-green-100 text-green-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {capitalizeFirstLetter(status.replace("_", " "))}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span className="truncate">{t('reporter')}: <strong>{report.reporterName || 'Unknown'}</strong> ({report.reporterEmail || '—'})</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {new Date(report.created_at).toLocaleDateString()} at {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex items-start ml-3">
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-36 h-8 text-xs bg-white border-gray-300 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                <SelectItem value="open" className="hover:bg-blue-50 focus:bg-blue-50">{t('open')}</SelectItem>
                <SelectItem value="in_progress" className="hover:bg-blue-50 focus:bg-blue-50">{t('inProgress')}</SelectItem>
                <SelectItem value="resolved" className="hover:bg-blue-50 focus:bg-blue-50">{t('resolved')}</SelectItem>
                <SelectItem value="closed" className="hover:bg-blue-50 focus:bg-blue-50">{t('closed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">{report.description}</p>
        <div className="flex justify-center">
          <button
            className="inline-flex items-center px-3 py-1.5 border border-blue-300 rounded-md shadow-sm text-xs font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
            </svg>
            {isOpen ? t('hideDetails') : t('viewDetails')}
          </button>
        </div>
      </div>

      {/* Collapsible Details */}
      {isOpen && (
        <div className="p-4 bg-gray-50">
          {/* Responses */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">{t('responses')} ({responses.length})</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {responses.length === 0 ? (
                <p className="text-gray-500 italic text-sm">{t('noResponsesYet')}</p>
              ) : (
                responses.map((response) => (
                  <div key={response.id} className="flex gap-2">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        A
                      </div>
                    </div>
                    <div className="flex-1 bg-white rounded-md p-2 shadow-sm border">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900 text-sm">{response.user_name} ({t('admin')})</p>
                        <p className="text-xs text-gray-500">{new Date(response.created_at).toLocaleString()}</p>
                      </div>
                      <p className="text-gray-700 text-sm">{response.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Response */}
          <div>
            <Label className="text-sm font-semibold text-gray-900 mb-1 block">{t('addResponse')}</Label>
            <Textarea
              value={newResponse}
              onChange={(e) => setNewResponse(e.target.value)}
              placeholder={t('typeYourResponse')}
              rows={3}
              className="mb-2 text-sm"
            />
            <div className="flex gap-2">
              <Button onClick={handleAddResponse} disabled={!newResponse.trim()} className="bg-blue-600 hover:bg-blue-700 text-sm h-8">
                {t('sendResponse')}
              </Button>
              <Button variant="outline" onClick={() => setNewResponse('')} className="text-sm h-8">
                {t('clear')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const [location, setLocation] = useLocation();
  const { t } = useTranslation();
  const [me, setMe] = useState<any>(null);
  const [bugReports, setBugReports] = useState<any[]>([]);

  // helper to load bug reports with reporter info
  const fetchBugReports = async () => {
    try {
      const bugReportsRes = await fetch("/api/admin/bug-reports");
      const bugReportsData = await bugReportsRes.json();
      const enriched = await Promise.all((bugReportsData || []).map(async (r: any) => {
        try {
          const uRes = await fetch(`/api/users/${r.user_id}`);
          if (!uRes.ok) return { ...r };
          const u = await uRes.json();
          return { ...r, reporterName: u.name, reporterEmail: u.email };
        } catch (e) {
          return { ...r };
        }
      }));
      setBugReports(enriched);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const meRes = await fetch("/api/me", { credentials: "include" });
        const meData = await meRes.json();
        if (!meData || meData.role !== "admin") {
          setLocation("/login");
          return;
        }
        setMe(meData);
        await fetchBugReports();
      } catch (err) {
        console.error(err);
        setLocation("/login");
      }
    };
    loadData();
    // If opened via /admin/bug-reports, we show the bugs view by default
  }, [setLocation]);

  // admin actions handled per report

  if (!me)
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">Loading admin panel...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('bugReport')}</h1>
                <p className="text-gray-600 text-sm">{t('reviewAndRespond')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-900">{t('totalReports')}</p>
                  <p className="text-lg font-bold text-blue-600">{bugReports.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-3 rounded-lg border border-yellow-200">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mr-2">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-yellow-900">{t('open')}</p>
                  <p className="text-lg font-bold text-yellow-600">{bugReports.filter(r => r.status === 'open').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-green-900">{t('resolved')}</p>
                  <p className="text-lg font-bold text-green-600">{bugReports.filter(r => r.status === 'resolved').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mr-2">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-purple-900">{t('featureRequests')}</p>
                  <p className="text-2xl font-bold text-purple-600">{bugReports.filter(r => r.type === 'feature').length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('allReports')}</h2>
          <p className="text-gray-600">{t('reviewAndRespond')}</p>
        </div>
        <div className="space-y-6">
          {bugReports.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">{t('noReports')}</h3>
              <p className="mt-1 text-sm text-gray-500">{t('getStartedWaiting')}</p>
            </div>
          ) : (
            bugReports.map((report) => (
              <BugReportCard key={report.id} report={report} onStatusUpdate={fetchBugReports} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

