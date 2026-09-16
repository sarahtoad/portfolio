export interface MenuItem {
  label: string;
  href: string;
  rune: string;
}

export const menuItems: MenuItem[] = [
  { label: "ABOUT", href: "/about", rune: "ᚨ" },
  { label: "EXPERIENCE", href: "/experience", rune: "ᛃ" },
  { label: "PROJECTS", href: "/projects", rune: "ᚺ" },
  { label: "CREATIVE", href: "/creative", rune: "ᛚ" },
  { label: "CONTACT", href: "/contact", rune: "ᛗ" },
];