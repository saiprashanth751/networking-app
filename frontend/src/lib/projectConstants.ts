import { Code, Smartphone, Brain, Gamepad2, Palette, Cpu, Link2, LayoutGrid } from 'lucide-react';

export const PROJECT_CATEGORIES = [
  { value: 'web', label: 'Web Application', icon: Code },
  { value: 'mobile', label: 'Mobile App', icon: Smartphone },
  { value: 'ai-ml', label: 'AI/ML', icon: Brain },
  { value: 'game', label: 'Game Development', icon: Gamepad2 },
  { value: 'design', label: 'Design/UI/UX', icon: Palette },
  { value: 'iot', label: 'IoT/Hardware', icon: Cpu },
  { value: 'blockchain', label: 'Blockchain/Web3', icon: Link2 },
  { value: 'other', label: 'Other', icon: LayoutGrid },
] as const;

export const PROJECT_STATUS = [
  { value: 'completed', label: 'Completed' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'archived', label: 'Archived' },
] as const;

export const POPULAR_TECH_STACK = [
  // Frontend
  'React', 'Vue.js', 'Angular', 'Next.js', 'Svelte', 'TypeScript', 'JavaScript',
  'HTML/CSS', 'Tailwind CSS', 'Bootstrap', 'Material-UI', 'Redux', 'React Query',
  
  // Backend
  'Node.js', 'Express', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Ruby on Rails',
  'ASP.NET', 'NestJS', 'GraphQL', 'REST API',
  
  // Mobile
  'React Native', 'Flutter', 'Swift', 'Kotlin', 'Ionic',
  
  // Database
  'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Firebase', 'Supabase', 'Prisma',
  
  // Cloud/DevOps
  'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes', 'Vercel', 'Netlify',
  
  // AI/ML
  'TensorFlow', 'PyTorch', 'scikit-learn', 'OpenAI', 'Hugging Face', 'Langchain',
  
  // Other
  'Git', 'GitHub Actions', 'CI/CD', 'Websockets', 'Socket.io', 'Three.js',
] as const;