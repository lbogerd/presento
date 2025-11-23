import { useState, useEffect, useCallback } from "react";
import { SlideViewer } from "./components/SlideViewer";
import { SlideEditor } from "./components/SlideEditor";
import { SlideList } from "./components/SlideList";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { Slide } from "./types";
import { Play, X } from "lucide-react";

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
      "Export to JSON (coming soon)",
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
    INITIAL_SLIDES[0].id
  );
  const [isPresenting, setIsPresenting] = useState(false);

  // Ensure activeSlideId is valid
  useEffect(() => {
    if (slides.length > 0 && !slides.find((s) => s.id === activeSlideId)) {
      setActiveSlideId(slides[0].id);
    }
  }, [slides, activeSlideId]);

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
      <div className="fixed inset-0 bg-white dark:bg-black z-50 flex flex-col font-mono">
        {/* Main Slide Area */}
        <div className="flex-1 relative overflow-hidden">
          {activeSlide && <SlideViewer slide={activeSlide} isActive={true} />}
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-gray-200 dark:bg-gray-800 w-full border-t-4 border-black dark:border-white">
          <div
            className="h-full bg-[#FFF500]"
            style={{
              width: `${((activeSlideIndex + 1) / slides.length) * 100}%`,
            }}
          />
        </div>

        {/* Bottom Control Bar */}
        <div className="h-20 bg-white dark:bg-black border-t-4 border-black dark:border-white flex items-center justify-between px-6 shrink-0">
          {/* Left: Slide Counter */}
          <div className="font-bold text-xl text-black dark:text-white">
            SLIDE {activeSlideIndex + 1}{" "}
            <span className="text-gray-400">/ {slides.length}</span>
          </div>

          {/* Center: Controls */}
          <div className="flex gap-4">
            <button
              onClick={prevSlide}
              disabled={activeSlideIndex === 0}
              className="px-6 py-2 bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
            >
              PREV
            </button>
            <button
              onClick={nextSlide}
              disabled={activeSlideIndex === slides.length - 1}
              className="px-6 py-2 bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
            >
              NEXT
            </button>
          </div>

          {/* Right: Exit */}
          <button
            onClick={() => setIsPresenting(false)}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF5D5D] border-2 border-black text-black font-bold hover:bg-black hover:text-[#FF5D5D] transition-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
          >
            <X size={20} strokeWidth={3} />
            EXIT
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f0f0f0] dark:bg-[#1a1a1a] text-black dark:text-white overflow-hidden font-mono">
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
        <div className="h-16 border-b-4 border-black dark:border-white flex items-center justify-between px-6 bg-white dark:bg-black">
          <h1 className="font-black text-2xl uppercase tracking-tighter">
            Presento
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPresenting(true)}
              className="flex items-center gap-2 px-6 py-2 bg-[#FF5D5D] border-2 border-black text-black font-bold uppercase hover:bg-black hover:text-[#FF5D5D] transition-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              <Play size={16} strokeWidth={3} />
              Present
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Slide Preview */}
          <div className="flex-1 bg-[#e0e0e0] dark:bg-[#2a2a2a] p-8 flex items-center justify-center overflow-hidden relative">
            <div className="aspect-video w-full max-w-5xl bg-white dark:bg-black border-4 border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] overflow-hidden relative">
              {activeSlide ? (
                <SlideViewer slide={activeSlide} isActive={true} />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 font-bold uppercase">
                  Select a slide to edit
                </div>
              )}
            </div>
          </div>

          {/* Editor Sidebar */}
          <div className="w-96 border-l-4 border-black dark:border-white bg-white dark:bg-black">
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
