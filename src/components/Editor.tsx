import { SlideViewer } from "./SlideViewer";
import { SlideEditor } from "./SlideEditor";
import { SlideList } from "./SlideList";
import { Button } from "./ui/Button";
import { Play } from "lucide-react";
import type { Slide } from "../types";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

interface EditorProps {
  slides: Slide[];
  presentationName: string;
  activeSlideId: string;
  onRenamePresentation: (name: string) => void;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
  onImport: (event: ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  onUpdate: (updatedSlide: Slide) => void;
}

export function Editor({
  slides,
  presentationName,
  activeSlideId,
  onRenamePresentation,
  onSelect,
  onAdd,
  onDelete,
  onReorder,
  onImport,
  onExport,
  onUpdate,
}: EditorProps) {
  const navigate = useNavigate();
  const activeSlide = slides.find((s) => s.id === activeSlideId);

  return (
    <div className="flex h-screen bg-(--color-bg) text-(--color-text) overflow-hidden font-mono">
      <SlideList
        slides={slides}
        presentationName={presentationName}
        onRenamePresentation={onRenamePresentation}
        activeSlideId={activeSlideId}
        onSelect={onSelect}
        onAdd={onAdd}
        onDelete={onDelete}
        onReorder={onReorder}
        onImport={onImport}
        onExport={onExport}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="h-16 border-b-4 border-(--color-border) flex items-center justify-between px-6 bg-(--color-surface)">
          <h1 className="font-black text-2xl uppercase tracking-tighter">
            Presento
          </h1>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                const index = slides.findIndex(s => s.id === activeSlideId);
                navigate(`/view/${index + 1}`);
              }}
              variant="danger"
              className="uppercase px-6"
            >
              <Play size={16} strokeWidth={3} />
              Present
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Slide Preview */}
          <div className="flex-1 bg-(--color-surface-muted) p-8 flex items-center justify-center overflow-hidden relative">
            <div className="aspect-video w-full max-w-5xl bg-(--color-surface) border-4 border-(--color-border) shadow-[12px_12px_0px_0px_var(--shadow-strong)] overflow-hidden relative">
              {activeSlide ? (
                <SlideViewer slide={activeSlide} isActive={true} />
              ) : (
                <div className="flex items-center justify-center h-full text-(--color-text-muted) font-bold uppercase">
                  Select a slide to edit
                </div>
              )}
            </div>
          </div>

          {/* Editor Sidebar */}
          <div className="w-96 border-l-4 border-(--color-border) bg-(--color-surface)">
            {activeSlide && (
              <SlideEditor slide={activeSlide} onUpdate={onUpdate} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
