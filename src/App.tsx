import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ChangeEvent,
} from "react";
import { SlideViewer } from "./components/SlideViewer";
import { SlideEditor } from "./components/SlideEditor";
import { SlideList } from "./components/SlideList";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { Slide } from "./types";
import { Play, X, Upload, Download } from "lucide-react";

const INITIAL_SLIDES: Slide[] = [
  {
    id: "1",
    layout: "title",
    title: "Welcome to Presento",
    content: "A lightweight slide creator built with React & Tailwind",
  },
  {
    id: "2",
    layout: "bullets",
    title: "Features",
    content: [
      "Simple Markdown-like editing",
      "Real-time preview",
      "Dark mode support",
      "Local storage persistence",
      "Manual JSON import/export",
    ],
  },
  {
    id: "3",
    layout: "code",
    title: "Code Snippets",
    code: `// Example code block
function hello() {
  console.log("Hello World!");
}`,
  },
];

function App() {
  const [slides, setSlides] = useLocalStorage<Slide[]>(
    "presento-slides",
    INITIAL_SLIDES
  );
  const [activeSlideId, setActiveSlideId] = useState<string>(
    () => slides[0]?.id ?? INITIAL_SLIDES[0].id
  );
  const [isPresenting, setIsPresenting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeSlideIndex = slides.findIndex((s) => s.id === activeSlideId);
  const activeSlide = slides[activeSlideIndex];

  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: crypto.randomUUID(),
      layout: "title",
      title: "New Slide",
      content: "",
    };
    setSlides([...slides, newSlide]);
    setActiveSlideId(newSlide.id);
  };

  const handleUpdateSlide = (updatedSlide: Slide) => {
    setSlides(slides.map((s) => (s.id === updatedSlide.id ? updatedSlide : s)));
  };

  const handleDeleteSlide = (id: string) => {
    if (slides.length <= 1) return; // Prevent deleting last slide
    const newSlides = slides.filter((s) => s.id !== id);
    setSlides(newSlides);
    if (activeSlideId === id) {
      setActiveSlideId(newSlides[0].id);
    }
  };

  const handleReorder = (dragIndex: number, hoverIndex: number) => {
    const newSlides = [...slides];
    const [removed] = newSlides.splice(dragIndex, 1);
    newSlides.splice(hoverIndex, 0, removed);
    setSlides(newSlides);
  };

  const nextSlide = useCallback(() => {
    if (activeSlideIndex < slides.length - 1) {
      setActiveSlideId(slides[activeSlideIndex + 1].id);
    }
  }, [activeSlideIndex, slides]);

  const prevSlide = useCallback(() => {
    if (activeSlideIndex > 0) {
      setActiveSlideId(slides[activeSlideIndex - 1].id);
    }
  }, [activeSlideIndex, slides]);

  const handleExportSlides = () => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      slides,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `presento-slides-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    URL.revokeObjectURL(url);
  };

  const handleImportSlides = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const importedSlides = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.slides)
        ? parsed.slides
        : null;

      if (!importedSlides || importedSlides.length === 0) {
        throw new Error("No slides found in file");
      }

      const sanitizedSlides: Slide[] = importedSlides.map((slide: Slide) => ({
        ...slide,
        id: slide.id || crypto.randomUUID(),
      }));

      setSlides(sanitizedSlides);
      setActiveSlideId(sanitizedSlides[0].id);
    } catch (error) {
      console.error(error);
      window.alert(
        "Failed to import slides. Please verify the JSON file and try again."
      );
    } finally {
      event.target.value = "";
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Space") {
        if (isPresenting) nextSlide();
      } else if (e.key === "ArrowLeft") {
        if (isPresenting) prevSlide();
      } else if (e.key === "Escape") {
        setIsPresenting(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPresenting, nextSlide, prevSlide]);

  if (isPresenting) {
    return (
      <div className="fixed inset-0 bg-(--color-surface) text-(--color-text) z-50 flex flex-col font-mono">
        {/* Main Slide Area */}
        <div className="flex-1 relative overflow-hidden">
          {activeSlide && <SlideViewer slide={activeSlide} isActive={true} />}
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-(--color-surface-muted) w-full border-t-4 border-(--color-border)">
          <div
            className="h-full bg-(--color-accent)"
            style={{
              width: `${((activeSlideIndex + 1) / slides.length) * 100}%`,
            }}
          />
        </div>

        {/* Bottom Control Bar */}
        <div className="h-20 bg-(--color-surface) border-t-4 border-(--color-border) flex items-center justify-between px-6 shrink-0">
          {/* Left: Slide Counter */}
          <div className="font-bold text-xl text-(--color-text)">
            SLIDE {activeSlideIndex + 1}{" "}
            <span className="text-(--color-text-muted)">/ {slides.length}</span>
          </div>

          {/* Center: Controls */}
          <div className="flex gap-4">
            <button
              onClick={prevSlide}
              disabled={activeSlideIndex === 0}
              className="px-6 py-2 bg-(--color-surface) border-2 border-(--color-border) text-(--color-text) font-bold hover:bg-(--color-panel) disabled:opacity-50 disabled:cursor-not-allowed transition-none shadow-[3px_3px_0px_0px_var(--shadow-strong)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
            >
              PREV
            </button>
            <button
              onClick={nextSlide}
              disabled={activeSlideIndex === slides.length - 1}
              className="px-6 py-2 bg-(--color-surface) border-2 border-(--color-border) text-(--color-text) font-bold hover:bg-(--color-panel) disabled:opacity-50 disabled:cursor-not-allowed transition-none shadow-[3px_3px_0px_0px_var(--shadow-strong)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
            >
              NEXT
            </button>
          </div>

          {/* Right: Exit */}
          <button
            onClick={() => setIsPresenting(false)}
            className="flex items-center gap-2 px-4 py-2 bg-(--color-danger) border-2 border-(--color-border) text-(--color-text) font-bold hover:bg-(--color-text) hover:text-(--color-danger) transition-none shadow-[3px_3px_0px_0px_var(--shadow-strong)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
          >
            <X size={20} strokeWidth={3} />
            EXIT
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-(--color-bg) text-(--color-text) overflow-hidden font-mono">
      <SlideList
        slides={slides}
        activeSlideId={activeSlideId}
        onSelect={setActiveSlideId}
        onAdd={handleAddSlide}
        onDelete={handleDeleteSlide}
        onReorder={handleReorder}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="h-16 border-b-4 border-(--color-border) flex items-center justify-between px-6 bg-(--color-surface)">
          <h1 className="font-black text-2xl uppercase tracking-tighter">
            Presento
          </h1>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImportSlides}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-(--color-panel) border-2 border-(--color-border) text-(--color-text) font-bold uppercase hover:bg-(--color-surface-muted) transition-none shadow-[3px_3px_0px_0px_var(--shadow-strong)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
            >
              <Upload size={16} strokeWidth={3} />
              Import JSON
            </button>
            <button
              onClick={handleExportSlides}
              className="flex items-center gap-2 px-4 py-2 bg-(--color-panel) border-2 border-(--color-border) text-(--color-text) font-bold uppercase hover:bg-(--color-surface-muted) transition-none shadow-[3px_3px_0px_0px_var(--shadow-strong)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
            >
              <Download size={16} strokeWidth={3} />
              Export JSON
            </button>
            <button
              onClick={() => setIsPresenting(true)}
              className="flex items-center gap-2 px-6 py-2 bg-(--color-danger) border-2 border-(--color-border) text-(--color-text) font-bold uppercase hover:bg-(--color-text) hover:text-(--color-danger) transition-none shadow-[3px_3px_0px_0px_var(--shadow-strong)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_var(--shadow-soft)] cursor-pointer"
            >
              <Play size={16} strokeWidth={3} />
              Present
            </button>
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
              <SlideEditor slide={activeSlide} onUpdate={handleUpdateSlide} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
