import { SlideViewer } from "./SlideViewer";
import { SlideEditor } from "./SlideEditor";
import { SlideList } from "./SlideList";
import { Button } from "./ui/Button";
import { Play } from "lucide-react";
import type { Slide } from "../types";
import type { ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface EditorProps {
  slides: Slide[];
  presentationName: string;
  onRenamePresentation: (name: string) => void;
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
  onRenamePresentation,
  onAdd,
  onDelete,
  onReorder,
  onImport,
  onExport,
  onUpdate,
}: EditorProps) {
  const navigate = useNavigate();
  const { slideIndex } = useParams();

  const parsedIndex = parseInt(slideIndex || "1", 10);
  const currentIndex = isNaN(parsedIndex)
    ? 0
    : Math.max(0, Math.min(parsedIndex - 1, slides.length - 1));
  const activeSlide = slides[currentIndex];
  const activeSlideId = activeSlide?.id;

  const handleSelect = (id: string) => {
    const index = slides.findIndex((s) => s.id === id);
    if (index !== -1) {
      navigate(`/edit/${index + 1}`);
    }
  };

  const handleAdd = () => {
    onAdd();
    // Navigate to the new slide (which will be at the end)
    // We use slides.length + 1 because the new slide hasn't been added to the 'slides' prop yet in this render cycle
    // but we know it will be appended.
    navigate(`/edit/${slides.length + 1}`);
  };

  const handleDelete = (id: string) => {
    if (slides.length <= 1) return;

    const indexToDelete = slides.findIndex((s) => s.id === id);
    if (indexToDelete === -1) return;

    // If we are deleting the active slide, we need to navigate
    if (id === activeSlideId) {
      // If deleting the last slide, go to the previous one
      // Otherwise stay at the current index (which will be the next slide after deletion)
      const newIndex =
        indexToDelete === slides.length - 1 ? indexToDelete : indexToDelete + 1;
      navigate(`/edit/${newIndex}`);
    } else if (indexToDelete < currentIndex) {
      // If deleting a slide before the current one, the current index shifts down
      navigate(`/edit/${currentIndex}`);
    }

    onDelete(id);
  };

  const handleReorder = (dragIndex: number, hoverIndex: number) => {
    if (dragIndex === currentIndex) {
      navigate(`/edit/${hoverIndex + 1}`);
    } else {
      let newIndex = currentIndex;
      if (dragIndex < currentIndex && hoverIndex >= currentIndex) {
        newIndex--;
      } else if (dragIndex > currentIndex && hoverIndex <= currentIndex) {
        newIndex++;
      }

      if (newIndex !== currentIndex) {
        navigate(`/edit/${newIndex + 1}`);
      }
    }

    onReorder(dragIndex, hoverIndex);
  };

  return (
    <div className="flex h-screen bg-(--color-bg) text-(--color-text) overflow-hidden font-mono">
      <SlideList
        slides={slides}
        presentationName={presentationName}
        onRenamePresentation={onRenamePresentation}
        activeSlideId={activeSlideId || ""}
        onSelect={handleSelect}
        onAdd={handleAdd}
        onDelete={handleDelete}
        onReorder={handleReorder}
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
                navigate(`/view/${currentIndex + 1}`);
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
