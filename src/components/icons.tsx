import type { SVGProps } from "react";
import {
  CircuitBoard,
  Cog,
  Bot,
  Router,
  Building2,
  Laptop,
  Globe,
  FlaskConical,
  Sprout,
  Briefcase,
  Ship,
  Calculator,
  Megaphone,
  Plane,
  School,
  BookCopy,
  Loader2
} from 'lucide-react';


export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M8 21v-4.99" />
      <path d="M8 10.01V3" />
      <path d="M16 21v-7.99" />
      <path d="M16 7.01V3" />
      <path d="M3 8h18" />
      <path d="M3 16h18" />
    </svg>
  ),
  spinner: Loader2,
  interactiveGrid: (props: SVGProps<SVGSVGElement>) => (
     <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      {...props}
    >
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  ),
  // Career Icons
  circuitBoard: CircuitBoard,
  cog: Cog,
  bot: Bot,
  router: Router,
  building2: Building2,
  laptop: Laptop,
  globe: Globe,
  flaskConical: FlaskConical,
  sprout: Sprout,
  briefcase: Briefcase,
  ship: Ship,
  calculator: Calculator,
  megaphone: Megaphone,
  plane: Plane,
  school: School,
  bookCopy: BookCopy,
};

export type IconKey = keyof typeof Icons;

// Exporting keys for the form select
export const iconKeys = Object.keys(Icons).filter(
  (key) => key !== "logo" && key !== "interactiveGrid" && key !== "spinner"
) as IconKey[];
