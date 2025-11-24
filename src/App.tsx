import { type ChangeEvent } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Editor } from "./components/Editor";
import { Presenter } from "./components/Presenter";
import { Home } from "./components/Home";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { Slide } from "./types";

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
    INITIAL_SLIDES,
  );
  const [presentationName, setPresentationName] = useLocalStorage<string>(
    "presento-name",
    "Slides",
  );

  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: crypto.randomUUID(),
      layout: "title",
      title: "New Slide",
      content: "",
    };
    setSlides([...slides, newSlide]);
  };

  const handleUpdateSlide = (updatedSlide: Slide) => {
    setSlides(slides.map((s) => (s.id === updatedSlide.id ? updatedSlide : s)));
  };

  const handleDeleteSlide = (id: string) => {
    if (slides.length <= 1) return; // Prevent deleting last slide
    const newSlides = slides.filter((s) => s.id !== id);
    setSlides(newSlides);
  };

  const handleReorder = (dragIndex: number, hoverIndex: number) => {
    const newSlides = [...slides];
    const [removed] = newSlides.splice(dragIndex, 1);
    newSlides.splice(hoverIndex, 0, removed);
    setSlides(newSlides);
  };

  const handleExportSlides = () => {
    const safeName = presentationName.trim() || "Slides";
    const slug =
      safeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 50) || "slides";
    const exportDate = new Date().toISOString().split("T")[0];
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      name: safeName,
      slides,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `presento-${slug}-${exportDate}.json`;
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
      if (typeof parsed?.name === "string") {
        const trimmedName = parsed.name.trim();
        setPresentationName(trimmedName.length === 0 ? "Slides" : trimmedName);
      }
    } catch (error) {
      console.error(error);
      window.alert(
        "Failed to import slides. Please verify the JSON file and try again.",
      );
    } finally {
      event.target.value = "";
    }
  };

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/edit/:slideIndex"
        element={
          <Editor
            slides={slides}
            presentationName={presentationName}
            onRenamePresentation={setPresentationName}
            onAdd={handleAddSlide}
            onDelete={handleDeleteSlide}
            onReorder={handleReorder}
            onImport={handleImportSlides}
            onExport={handleExportSlides}
            onUpdate={handleUpdateSlide}
          />
        }
      />
      <Route path="/edit" element={<Navigate to="/edit/1" replace />} />
      <Route path="/view/:slideIndex" element={<Presenter slides={slides} />} />
      <Route path="/view" element={<Navigate to="/view/1" replace />} />
    </Routes>
  );
}

export default App;
