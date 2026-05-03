import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FeedbackModal } from "@/components/FeedbackModal";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <button
          onClick={() => setFeedbackOpen(true)}
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg text-white text-sm font-medium transition-transform hover:scale-105 active:scale-95 print:hidden"
          style={{ backgroundColor: "#1B3A5C" }}
          aria-label="משוב פיילוט"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="hidden sm:inline">משוב פיילוט</span>
        </button>
        <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
