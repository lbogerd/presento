import React from "react";
import type { Slide } from "../types";
import { Plus, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

interface SlideListProps {
  slides: Slide[];
  presentationName: string;
  onRenamePresentation: (name: string) => void;
  activeSlideId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
}

interface SortableSlideProps {
  slide: Slide;
  index: number;
  activeSlideId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const SortableSlide: React.FC<SortableSlideProps> = ({
  slide,
  index,
  activeSlideId,
  onSelect,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect(slide.id)}
      className={clsx(
        "group relative flex items-center gap-3 p-3 cursor-pointer transition-none border-2",
        activeSlideId === slide.id
          ? "bg-(--color-accent) border-(--color-border) text-(--color-text) shadow-[4px_4px_0px_0px_var(--shadow-strong)] -translate-x-0.5 -translate-y-0.5"
          : "bg-(--color-surface) border-(--color-border) text-(--color-text) hover:bg-(--color-panel) hover:shadow-[4px_4px_0px_0px_var(--shadow-soft)] hover:-translate-x-0.5 hover:-translate-y-0.5"
      )}
    >
      <span
        className={clsx(
          "text-xs font-bold font-mono w-6 h-6 flex items-center justify-center border-2 border-(--color-border)",
          activeSlideId === slide.id
            ? "bg-(--color-text) text-(--color-surface)"
            : "bg-(--color-surface-muted) text-(--color-text)"
        )}
      >
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate uppercase">
          {slide.title || "UNTITLED"}
        </p>
        <p className="text-xs opacity-70 truncate font-mono">{slide.layout}</p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(slide.id);
        }}
        className="opacity-0 group-hover:opacity-100 p-1.5 text-(--color-text) hover:bg-(--color-danger) hover:text-(--color-text) border-2 border-transparent hover:border-(--color-border) transition-none"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Trash2 size={14} strokeWidth={3} />
      </button>
    </div>
  );
};

export const SlideList: React.FC<SlideListProps> = ({
  slides,
  presentationName,
  onRenamePresentation,
  activeSlideId,
  onSelect,
  onAdd,
  onDelete,
  onReorder,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = slides.findIndex((s) => s.id === active.id);
      const newIndex = slides.findIndex((s) => s.id === over.id);
      onReorder(oldIndex, newIndex);
    }
  }

  return (
    <div className="flex flex-col h-full bg-(--color-surface) border-r-4 border-(--color-border) w-72">
      <div className="h-16 px-4 border-b-4 border-(--color-border) flex items-center justify-between bg-(--color-panel)">
        <input
          type="text"
          aria-label="Presentation name"
          value={presentationName}
          onChange={(event) => onRenamePresentation(event.target.value)}
          onBlur={() => {
            const trimmed = presentationName.trim();
            onRenamePresentation(trimmed.length === 0 ? "Slides" : trimmed);
          }}
          placeholder="Slides"
          className="font-bold text-(--color-text) uppercase tracking-wider bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-(--color-accent) px-2 -mx-2 py-1"
        />
        <button
          onClick={onAdd}
          className="p-2 bg-(--color-positive) border-2 border-(--color-border) text-(--color-text) hover:bg-(--color-text) hover:text-(--color-positive) transition-none shadow-[3px_3px_0px_0px_var(--shadow-strong)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
          title="Add Slide"
        >
          <Plus size={20} strokeWidth={3} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-(--color-panel)">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={slides.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {slides.map((slide, index) => (
              <SortableSlide
                key={slide.id}
                slide={slide}
                index={index}
                activeSlideId={activeSlideId}
                onSelect={onSelect}
                onDelete={onDelete}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};
