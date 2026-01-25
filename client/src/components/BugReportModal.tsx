import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bug, Lightbulb } from "lucide-react";

const bugReportSchema = z.object({
  type: z.enum(["bug", "feature_request"]),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type BugReportForm = z.infer<typeof bugReportSchema>;

interface BugReportModalProps {
  children: React.ReactNode;
}

export function BugReportModal({ children }: BugReportModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<BugReportForm>({
    resolver: zodResolver(bugReportSchema),
    defaultValues: {
      type: "bug",
      message: "",
    },
  });

  const onSubmit = async (data: BugReportForm) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/bug-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Report Submitted",
          description: "Thank you for your feedback! We'll review it shortly.",
        });
        setOpen(false);
        form.reset();
      } else {
        const error = await response.json();
        toast({
          title: "Failed to submit report",
          description: error.message || "Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to submit bug report:", error);
      toast({
        title: "Failed to submit report",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
<<<<<<< HEAD
      <DialogContent className="sm:max-w-[500px] bg-white border-2 border-gray-200 shadow-2xl">
=======
      <DialogContent className="sm:max-w-[500px]">
>>>>>>> d71d32f177fe4c2b8ae1b91763d41c1b8c70d04b
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Report Issue
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Issue Type</label>
            <Select
              value={form.watch("type")}
              onValueChange={(value) => form.setValue("type", value as "bug" | "feature_request")}
            >
<<<<<<< HEAD
              <SelectTrigger className="bg-white border-2 border-gray-200 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-gray-200 shadow-lg">
=======
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
>>>>>>> d71d32f177fe4c2b8ae1b91763d41c1b8c70d04b
                <SelectItem value="bug">
                  <div className="flex items-center gap-2">
                    <Bug className="h-4 w-4 text-red-500" />
                    Bug Report
                  </div>
                </SelectItem>
                <SelectItem value="feature_request">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Feature Request
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder={
                form.watch("type") === "bug"
                  ? "Describe the bug you encountered. Include steps to reproduce, error messages, and what you expected to happen."
                  : "Describe the feature you'd like to see. Explain how it would work and why it would be useful."
              }
              className="min-h-[120px]"
              {...form.register("message")}
            />
            {form.formState.errors.message && (
              <p className="text-sm text-red-500">{form.formState.errors.message.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}