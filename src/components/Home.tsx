import { Button } from "./ui/Button";
import { Presentation, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-(--color-bg) text-(--color-text) items-center justify-center font-mono">
      <div className="max-w-md w-full p-8 bg-(--color-surface) border-4 border-(--color-border) shadow-[12px_12px_0px_0px_var(--shadow-strong)] text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-(--color-accent) text-(--color-bg) rounded-full">
            <Presentation size={48} strokeWidth={2} />
          </div>
        </div>
        
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">
          Presento
        </h1>
        <p className="text-(--color-text-muted) mb-8">
          Create beautiful slides with Markdown and React.
        </p>

        <div className="space-y-4">
          <Button 
            onClick={() => navigate("/edit/1")} 
            className="w-full py-6 text-lg uppercase"
          >
            Open Presentation
          </Button>
          
          <Button 
            variant="secondary"
            className="w-full py-6 text-lg uppercase"
            disabled
          >
            <Plus size={20} className="mr-2" />
            New Presentation
          </Button>
          <p className="text-xs text-(--color-text-muted) uppercase">
            Multi-presentation support coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
