import React, { useState } from "react";
import { Bug, Lightbulb, MessageSquare, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function BugReportIcon() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !description.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/bug-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-white/20 hover:border-white/40 hover:scale-105"
          onMouseEnter={() => {
            toast({
              title: t('reportBugOrFeature'),
              description: t('bugReportToastMessage'),
            });
          }}
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
                  disabled={loading || !type || !description.trim()}
                  className="flex-1 h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t('submitting')}
                    </>
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
  );
}