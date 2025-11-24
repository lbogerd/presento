import React from "react";
import type { Slide, SlideLayout } from "../types";
import { Layout, Type, Image, Code } from "lucide-react";

interface SlideEditorProps {
  slide: Slide;
  onUpdate: (updatedSlide: Slide) => void;
}

export const SlideEditor: React.FC<SlideEditorProps> = ({
  slide,
  onUpdate,
}) => {
  const handleChange = (field: keyof Slide, value: Slide[keyof Slide]) => {
    onUpdate({ ...slide, [field]: value });
  };

  const handleContentChange = (value: string) => {
    if (slide.layout === "bullets") {
      handleChange("content", value.split("\n"));
    } else {
      handleChange("content", value);
    }
  };

  const getContentValue = () => {
    if (Array.isArray(slide.content)) {
      return slide.content.join("\n");
    }
    return slide.content || "";
  };

  return (
    <div className="p-6 space-y-6 bg-(--color-surface) h-full overflow-y-auto">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-(--color-text) mb-2">
          Layout
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: "title", icon: Type, label: "Title" },
            { id: "bullets", icon: Layout, label: "List" },
            { id: "image-center", icon: Image, label: "Image" },
            { id: "code", icon: Code, label: "Code" },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => handleChange("layout", type.id as SlideLayout)}
              className={`p-3 flex flex-col items-center justify-center gap-2 transition-none border-2 border-(--color-border) ${
                slide.layout === type.id
                  ? "bg-(--color-text) text-(--color-surface) shadow-[4px_4px_0px_0px_var(--shadow-strong)] -translate-x-0.5 -translate-y-0.5"
                  : "bg-(--color-surface) text-(--color-text) hover:bg-(--color-panel) hover:shadow-[4px_4px_0px_0px_var(--shadow-soft)] hover:-translate-x-0.5 hover:-translate-y-0.5"
              }`}
              title={type.label}
            >
              <type.icon size={20} strokeWidth={2.5} />
              <span className="text-xs font-bold uppercase">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-(--color-text) mb-2">
          Title
        </label>
        <input
          type="text"
          value={slide.title || ""}
          onChange={(e) => handleChange("title", e.target.value)}
          className="w-full px-3 py-2 border-2 border-(--color-border) bg-(--color-surface) text-(--color-text) focus:outline-none focus:bg-(--color-accent) focus:text-(--color-text) transition-none placeholder:text-gray-500"
          placeholder="SLIDE TITLE"
        />
      </div>

      {slide.layout === "image-center" && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-(--color-text) mb-2">
              Image URL
            </label>
            <input
              type="text"
              value={slide.image || ""}
              onChange={(e) => handleChange("image", e.target.value)}
              className="w-full px-3 py-2 border-2 border-(--color-border) bg-(--color-surface) text-(--color-text) focus:outline-none focus:bg-(--color-accent) focus:text-(--color-text) transition-none placeholder:text-gray-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-(--color-text) mb-2">
                Fit
              </label>
              <select
                value={slide.imageFit || "contain"}
                onChange={(e) => handleChange("imageFit", e.target.value)}
                className="w-full px-3 py-2 border-2 border-(--color-border) bg-(--color-surface) text-(--color-text) focus:outline-none focus:bg-(--color-accent) focus:text-(--color-text) transition-none appearance-none cursor-pointer"
              >
                <option value="contain">CONTAIN</option>
                <option value="cover">COVER</option>
                <option value="fill">FILL</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-(--color-text) mb-2">
                Scale ({slide.imageScale || 100}%)
              </label>
              <input
                type="range"
                min="10"
                max="200"
                step="10"
                value={slide.imageScale || 100}
                onChange={(e) =>
                  handleChange("imageScale", parseInt(e.target.value))
                }
                className="w-full h-2 bg-(--color-surface-muted) rounded-none appearance-none cursor-pointer border border-(--color-border) [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-(--color-text) [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-(--color-border)"
              />
            </div>
          </div>
        </div>
      )}

      {slide.layout === "code" ? (
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-(--color-text) mb-2">
            Code
          </label>
          <textarea
            value={slide.code || ""}
            onChange={(e) => handleChange("code", e.target.value)}
            className="w-full px-3 py-2 border-2 border-(--color-border) bg-(--color-surface) text-(--color-text) focus:outline-none focus:bg-(--color-accent) focus:text-(--color-text) transition-none font-mono text-sm h-48 placeholder:text-gray-500"
            placeholder="// Enter code here..."
          />
        </div>
      ) : (
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-(--color-text) mb-2">
            {slide.layout === "bullets"
              ? "Bullet Points (one per line)"
              : "Content"}
          </label>
          <textarea
            value={getContentValue()}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full px-3 py-2 border-2 border-(--color-border) bg-(--color-surface) text-(--color-text) focus:outline-none focus:bg-(--color-accent) focus:text-(--color-text) transition-none h-32 placeholder:text-gray-500"
            placeholder="Slide content..."
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-(--color-text) mb-2">
          Speaker Notes
        </label>
        <textarea
          value={slide.notes || ""}
          onChange={(e) => handleChange("notes", e.target.value)}
          className="w-full px-3 py-2 border-2 border-(--color-border) bg-(--color-surface) text-(--color-text) focus:outline-none focus:bg-(--color-accent) focus:text-(--color-text) transition-none h-24 text-sm placeholder:text-gray-500"
          placeholder="Private notes for the presenter..."
        />
      </div>
    </div>
  );
};
