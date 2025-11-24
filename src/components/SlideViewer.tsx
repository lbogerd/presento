import React from "react";
import type { Slide } from "../types";
import { clsx } from "clsx";

interface SlideViewerProps {
  slide: Slide;
  isActive?: boolean;
}

export const SlideViewer: React.FC<SlideViewerProps> = ({
  slide,
  isActive = true,
}) => {
  const baseClasses =
    "w-full h-full flex flex-col p-16 bg-(--color-surface) text-(--color-text) transition-all duration-500 overflow-hidden font-mono";

  const renderContent = () => {
    switch (slide.layout) {
      case "title":
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <h1 className="text-7xl font-black tracking-tighter uppercase">
              {slide.title}
            </h1>
            {slide.content && (
              <p className="text-3xl font-bold text-(--color-text-muted) uppercase tracking-wide">
                {slide.content}
              </p>
            )}
          </div>
        );

      case "bullets":
        return (
          <div className="flex flex-col h-full space-y-8">
            <h2 className="text-5xl font-black border-b-4 pb-4 border-(--color-border) uppercase tracking-tight">
              {slide.title}
            </h2>
            <ul className="list-disc list-inside space-y-4 text-2xl pl-4 font-bold">
              {Array.isArray(slide.content) ? (
                slide.content.map((item, idx) => (
                  <li
                    key={idx}
                    className="leading-relaxed marker:text-(--color-text)"
                  >
                    {item}
                  </li>
                ))
              ) : (
                <li>{slide.content}</li>
              )}
            </ul>
          </div>
        );

      case "image-center":
        return (
          <div className="flex flex-col h-full items-center justify-center space-y-6 relative">
            {slide.title && (
              <h2 className="text-4xl font-black absolute top-12 uppercase tracking-tight z-10 bg-(--color-surface)/90 px-4 py-2 border-2 border-(--color-border) shadow-[4px_4px_0px_0px_var(--shadow-soft)]">
                {slide.title}
              </h2>
            )}
            {slide.image && (
              <div
                className="relative transition-transform duration-300 origin-center"
                style={{
                  transform: `scale(${(slide.imageScale || 100) / 100})`,
                }}
              >
                <img
                  src={slide.image}
                  alt={slide.title || "Slide image"}
                  className={clsx(
                    "max-h-[70vh] max-w-full border-4 border-(--color-border) shadow-[8px_8px_0px_0px_var(--shadow-soft)]",
                    slide.imageFit === "cover"
                      ? "object-cover"
                      : slide.imageFit === "fill"
                        ? "object-fill"
                        : "object-contain",
                  )}
                />
              </div>
            )}
            {typeof slide.content === "string" && (
              <p className="text-xl font-bold text-(--color-text-muted) uppercase z-10 bg-(--color-surface)/90 px-2">
                {slide.content}
              </p>
            )}
          </div>
        );

      case "code":
        return (
          <div className="flex flex-col h-full space-y-6">
            <h2 className="text-4xl font-black uppercase tracking-tight">
              {slide.title}
            </h2>
            <pre className="flex-1 bg-(--color-panel) p-6 border-4 border-(--color-border) overflow-auto text-sm font-mono shadow-[8px_8px_0px_0px_var(--shadow-soft)]">
              <code>{slide.code || slide.content}</code>
            </pre>
          </div>
        );

      case "blank":
      default:
        return (
          <div className="flex flex-col h-full items-center justify-center">
            {slide.content && <div className="text-xl">{slide.content}</div>}
          </div>
        );
    }
  };

  return (
    <div
      className={clsx(
        baseClasses,
        isActive
          ? "opacity-100 scale-100"
          : "opacity-0 scale-95 absolute inset-0 pointer-events-none",
      )}
    >
      {renderContent()}
    </div>
  );
};
