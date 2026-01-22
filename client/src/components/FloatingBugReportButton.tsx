import { useState } from "react";
import { Bug, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BugReportModal } from "@/components/BugReportModal";

export function FloatingBugReportButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          onClick={() => setIsModalOpen(true)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-red-600 hover:bg-red-700 border-2 border-white"
          title="Report an issue or suggest a feature"
        >
          <Bug className="h-6 w-6 text-white" />
        </Button>
      </div>

      <BugReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}