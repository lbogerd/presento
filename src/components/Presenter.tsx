import { useEffect, useCallback } from "react";
import { SlideViewer } from "./SlideViewer";
import { Button } from "./ui/Button";
import { X } from "lucide-react";
import type { Slide } from "../types";
import { useNavigate, useParams } from "react-router-dom";

interface PresenterProps {
  slides: Slide[];
  onSlideChange?: (id: string) => void;
}

export function Presenter({ slides, onSlideChange }: PresenterProps) {
  const navigate = useNavigate();
  const { slideIndex } = useParams();

  const parsedIndex = parseInt(slideIndex || "1", 10);
  const currentIndex = isNaN(parsedIndex)
    ? 0
    : Math.max(0, Math.min(parsedIndex - 1, slides.length - 1));

  const activeSlide = slides[currentIndex];

  // Sync active slide back to parent if needed
  useEffect(() => {
    if (activeSlide && onSlideChange) {
      onSlideChange(activeSlide.id);
    }
  }, [activeSlide, onSlideChange]);

  const nextSlide = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      navigate(`/view/${currentIndex + 2}`);
    }
  }, [currentIndex, slides.length, navigate]);

  const prevSlide = useCallback(() => {
    if (currentIndex > 0) {
      navigate(`/view/${currentIndex}`);
    }
  }, [currentIndex, navigate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Space") {
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (e.key === "Escape") {
        navigate("/");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, navigate]);

  if (!activeSlide) return null;

  return (
    <div className="fixed inset-0 bg-(--color-surface) text-(--color-text) z-50 flex flex-col font-mono">
      {/* Main Slide Area */}
      <div className="flex-1 relative overflow-hidden">
        <SlideViewer slide={activeSlide} isActive={true} />
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-(--color-surface-muted) w-full border-t-4 border-(--color-border)">
        <div
          className="h-full bg-(--color-accent)"
          style={{
            width: `${((currentIndex + 1) / slides.length) * 100}%`,
          }}
        />
      </div>

      {/* Bottom Control Bar */}
      <div className="h-20 bg-(--color-surface) border-t-4 border-(--color-border) flex items-center justify-between px-6 shrink-0">
        {/* Left: Slide Counter */}
        <div className="font-bold text-xl text-(--color-text)">
          SLIDE {currentIndex + 1}{" "}
          <span className="text-(--color-text-muted)">/ {slides.length}</span>
        </div>

        {/* Center: Controls */}
        <div className="flex gap-4">
          <Button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            variant="secondary"
            className="px-6"
          >
            PREV
          </Button>
          <Button
            onClick={nextSlide}
            disabled={currentIndex === slides.length - 1}
            variant="secondary"
            className="px-6"
          >
            NEXT
          </Button>
        </div>

        {/* Right: Exit */}
        <Button onClick={() => navigate("/")} variant="danger">
          <X size={20} strokeWidth={3} />
          EXIT
        </Button>
      </div>
    </div>
  );
}
