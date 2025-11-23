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
          ? "bg-[#FFF500] border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5"
          : "bg-white dark:bg-black border-black dark:border-white text-black dark:text-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-x-0.5 hover:-translate-y-0.5"
      )}
    >
      <span
        className={clsx(
          "text-xs font-bold font-mono w-6 h-6 flex items-center justify-center border-2 border-black",
          activeSlideId === slide.id
            ? "bg-black text-white"
            : "bg-gray-200 text-black"
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
        className="opacity-0 group-hover:opacity-100 p-1.5 text-black dark:text-white hover:bg-red-500 hover:text-white border-2 border-transparent hover:border-black transition-none"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Trash2 size={14} strokeWidth={3} />
      </button>
    </div>
  );
};

export const SlideList: React.FC<SlideListProps> = ({
  slides,
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
    <div className="flex flex-col h-full bg-white dark:bg-black border-r-4 border-black dark:border-white w-72">
      <div className="p-4 border-b-4 border-black dark:border-white flex justify-between items-center bg-[#f0f0f0] dark:bg-[#1a1a1a]">
        <h2 className="font-bold text-black dark:text-white uppercase tracking-wider">
          Slides
        </h2>
        <button
          onClick={onAdd}
          className="p-2 bg-[#88FF88] border-2 border-black text-black hover:bg-black hover:text-[#88FF88] transition-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
          title="Add Slide"
        >
          <Plus size={20} strokeWidth={3} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f8f8] dark:bg-[#111]">
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
