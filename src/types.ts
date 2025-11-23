export type SlideLayout =
  | "title"
  | "bullets"
  | "image-center"
  | "code"
  | "blank";

export interface Slide {
  id: string;
  layout: SlideLayout;
  title?: string;
  content?: string | string[]; // String for text, array for bullets
  image?: string; // URL for image slides
  imageFit?: "contain" | "cover" | "fill";
  imageScale?: number; // Percentage, default 100
  code?: string; // For code snippets
  notes?: string; // Speaker notes
}

export interface Presentation {
  title: string;
  author: string;
  theme: "light" | "dark";
  slides: Slide[];
}
