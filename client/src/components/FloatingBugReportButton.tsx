<<<<<<< HEAD
import { Bug } from "lucide-react";
=======
import { useState } from "react";
import { Bug, X } from "lucide-react";
>>>>>>> d71d32f177fe4c2b8ae1b91763d41c1b8c70d04b
import { Button } from "@/components/ui/button";
import { BugReportModal } from "@/components/BugReportModal";

export function FloatingBugReportButton() {
<<<<<<< HEAD
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
=======
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
>>>>>>> d71d32f177fe4c2b8ae1b91763d41c1b8c70d04b
  );
}