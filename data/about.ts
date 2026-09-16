import type { AboutContent } from "@/lib/types";

export const aboutContent: AboutContent = {
  heroTagline: "Builder of digital realms, weaver of code and creativity",
  bio: "I'm Sarah Khodja, a software engineer and creative soul from Algeria. I craft digital experiences that bridge logic and art — from building full-stack applications to sculpting 3D worlds, composing music with violin, and capturing moments through my lens. My journey through computer science has been one of constant discovery, blending technical precision with creative expression.",
  interests: [
    { glyph: "💻", name: "Web Development", description: "Building full-stack applications with modern frameworks" },
    { glyph: "🎨", name: "Blender & 3D", description: "Creating digital worlds and visual art in 3D space" },
    { glyph: "📷", name: "Photography", description: "Capturing moments and compositions through the lens" },
    { glyph: "🎵", name: "Violin", description: "Playing classical and contemporary pieces on the violin" },
    { glyph: "🎬", name: "Cinema", description: "Exploring the art of visual storytelling through film" },
    { glyph: "📖", name: "Visual Storytelling", description: "Weaving narratives through images and design" },
    { glyph: "🎮", name: "Gaming", description: "Exploring virtual worlds and game design philosophy" },
    { glyph: "✍️", name: "Writing", description: "Crafting stories and technical articles" },
    { glyph: "🌍", name: "Open Source", description: "Contributing to and advocating for open-source software" },
    { glyph: "🧠", name: "AI & ML", description: "Exploring the frontiers of artificial intelligence" },
  ],
  skillBars: [
    { name: "TypeScript / JavaScript", level: 85, color: "#3178c6" },
    { name: "React / Next.js", level: 80, color: "#61dafb" },
    { name: "Python", level: 75, color: "#3776ab" },
    { name: "Node.js", level: 70, color: "#339933" },
    { name: "CSS / Tailwind", level: 80, color: "#06b6d4" },
    { name: "Git & GitHub", level: 75, color: "#f05032" },
  ],
  skillGroups: [
    {
      tier: "EXPERT",
      title: "Frontend Mastery",
      skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "HTML/CSS"],
    },
    {
      tier: "ADEPT",
      title: "Backend & Tools",
      skills: ["Node.js", "Express", "PostgreSQL", "MongoDB", "REST APIs", "GraphQL"],
    },
    {
      tier: "APPRENTICE",
      title: "Emerging Skills",
      skills: ["Docker", "AWS", "Three.js", "Blender", "Figma", "Linux"],
    },
  ],
  education: [
    { kind: "current", title: "Master's in Software Engineering", line: "University of Algiers — 2024–2026" },
    { kind: "previous", title: "Licence in Computer Science", line: "University of Algiers — 2021–2024" },
  ],
};
