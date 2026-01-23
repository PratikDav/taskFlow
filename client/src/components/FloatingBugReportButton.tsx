import { Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BugReportModal } from "@/components/BugReportModal";

export function FloatingBugReportButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <BugReportModal>
        <Button
          size="lg"
          className="h-16 w-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-transparent hover:bg-red-50 border-0"
          title="Report an issue or suggest a feature"
        >
          <Bug className="h-16 w-16 text-red-600 hover:text-red-700" />
        </Button>
      </BugReportModal>
    </div>
  );
}