import React, { useState, useEffect } from "react";
import { Bug, Lightbulb, MessageSquare, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/LanguageContext";
import { useToast } from "@/hooks/use-toast";

export default function BugReportIcon() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipTimeout, setTooltipTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    return () => {
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
      }
    };
  }, [tooltipTimeout]);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        const user = await res.json();
        setIsLoggedIn(!!user);
      } catch (err) {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  const handleMouseEnter = () => {
    const timeout = setTimeout(() => setShowTooltip(true), 300); // 300ms delay
    setTooltipTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
      setTooltipTimeout(null);
    }
    setShowTooltip(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !description.trim()) return;

    // Check if user is logged in
    if (isLoggedIn === false) {
      toast({
        title: t('error'),
        description: "You must be logged in to submit bug reports.",
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/bug-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type,
          title: type === "bug" ? "Bug Report" : "Feature Request",
          description
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit");
      }

      toast({
        title: t('success'),
        description: t('thankYouFeedback'),
      });
      setIsOpen(false);
      setType("");
      setDescription("");
    } catch (err) {
      console.error(err);
      toast({
        title: t('error'),
        description: t('failedToSubmit'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Custom Tooltip */}
      {showTooltip && (
        <div className="fixed bottom-20 right-4 z-50 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <div className="relative">
            {/* Tooltip Arrow */}
            <div className="absolute bottom-[-6px] right-6 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-white shadow-sm"></div>

            {/* Tooltip Content */}
            <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/50 p-4 max-w-xs ring-1 ring-black/5">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Bug className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1 leading-tight">
                    {t('reportBugOrFeature')}
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {t('bugReportToastMessage')}
                  </p>
                </div>
              </div>

              {/* Subtle hint */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                  Click to report issues or suggest features
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-white/20 hover:border-white/40 hover:scale-105"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Bug className="h-6 w-6" />
          </Button>
        </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 border-0 shadow-2xl">
        <div className="relative">
          {/* Custom Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-white/80 hover:bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <X className="h-4 w-4 text-gray-600 hover:text-gray-800" />
          </Button>
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 p-4 rounded-t-lg">
            <DialogHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-xl font-bold text-white mb-1">
                {t('reportBugOrFeature')}
              </DialogTitle>
              <p className="text-blue-100 text-sm">
                {t('helpUsImprove')}
              </p>
            </DialogHeader>
          </div>

          {/* Form content */}
          <div className="p-4">
            {isLoggedIn === false && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 text-center">
                  You must be logged in to submit bug reports or feature requests.
                </p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {t('selectType')}
                </Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-12 bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 overflow-hidden">
                    <SelectValue placeholder={t('selectType')}>
                      {type === 'bug' && (
                        <div className="flex items-center gap-2 truncate">
                          <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Bug className="h-3 w-3 text-red-600" />
                          </div>
                          <span className="truncate">{t('bugReport')}</span>
                        </div>
                      )}
                      {type === 'feature' && (
                        <div className="flex items-center gap-2 truncate">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Lightbulb className="h-3 w-3 text-green-600" />
                          </div>
                          <span className="truncate">{t('featureRequest')}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-gray-200 shadow-xl rounded-lg">
                    <SelectItem
                      value="bug"
                      className="hover:bg-red-50 focus:bg-red-50 py-3 px-4 rounded-md mx-1 my-1 transition-colors duration-150 flex items-center gap-3"
                    >
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <Bug className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{t('bugReport')}</div>
                        <div className="text-xs text-gray-500">{t('reportIssuesOrProblems')}</div>
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="feature"
                      className="hover:bg-green-50 focus:bg-green-50 py-3 px-4 rounded-md mx-1 my-1 transition-colors duration-150 flex items-center gap-3"
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Lightbulb className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{t('featureRequest')}</div>
                        <div className="text-xs text-gray-500">{t('suggestNewFeatures')}</div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {t('description')}
                </Label>
                <Textarea
                  id="description"
                  placeholder={t('describeIssueOrRequest')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none"
                />
                <p className="text-xs text-gray-500">
                  {t('beDetailedAsPossible')}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 h-10 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !type || !description.trim() || isLoggedIn === false}
                  className="flex-1 h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t('submitting')}
                    </>
                  ) : isLoggedIn === false ? (
                    "Login Required"
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {t('submit')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}