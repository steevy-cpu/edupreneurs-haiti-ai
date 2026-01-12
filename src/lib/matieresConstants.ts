import { 
  Calculator, 
  BookOpen, 
  FlaskConical,
  Globe, 
  Flag, 
  MessageCircle, 
  Map,
  Beaker, 
  Users, 
  Palette, 
  Activity,
  Languages,
  GraduationCap,
  Award
} from "lucide-react";

export type GradeLevel = "7AF" | "8AF" | "9AF" | "NS1" | "NS2" | "NS3" | "NS4";
export type Series = "LLA" | "SES" | "SMP" | "SVT";

// Valid grades for validation
export const VALID_GRADES: GradeLevel[] = ["7AF", "8AF", "9AF", "NS1", "NS2", "NS3", "NS4"];

export const gradeLevels = [
  { id: "7AF" as GradeLevel, label: "7AF", fullName: "7ème année fondamentale" },
  { id: "8AF" as GradeLevel, label: "8AF", fullName: "8ème année fondamentale" },
  { id: "9AF" as GradeLevel, label: "9AF", fullName: "9ème année fondamentale" },
  { id: "NS1" as GradeLevel, label: "NS1", fullName: "1ère secondaire" },
  { id: "NS2" as GradeLevel, label: "NS2", fullName: "2ème secondaire" },
  { id: "NS3" as GradeLevel, label: "NS3", fullName: "3ème secondaire" },
  { id: "NS4" as GradeLevel, label: "NS4", fullName: "4ème secondaire" }
];

export const iconMap: Record<string, any> = {
  'calculator': Calculator, 'book-open': BookOpen, 'flask-conical': FlaskConical,
  'globe': Globe, 'flag': Flag, 'message-circle': MessageCircle, 'map': Map,
  'beaker': Beaker, 'users': Users, 'palette': Palette, 'activity': Activity,
  'languages': Languages, 'Calculator': Calculator, 'BookOpen': BookOpen,
  'Languages': Languages, 'Globe': Globe, 'MessageSquare': MessageCircle,
  'BookA': BookOpen, 'PieChart': Calculator, 'Binary': Calculator, 'Sigma': Calculator,
  'FlaskConical': FlaskConical, 'Flask': Beaker, 'Atom': Beaker, 'Microscope': Beaker,
  'Dna': Beaker, 'Leaf': Beaker, 'Beaker': Beaker, 'Landmark': Map, 'Users': Users,
  'Globe2': Globe, 'BookText': BookOpen, 'Map': Map, 'Scale': Users, 'Palette': Palette,
  'Music': Palette, 'Drama': Palette, 'Paintbrush': Palette, 'Dumbbell': Activity,
  'Trophy': Award, 'Activity': Activity, 'Heart': Activity, 'Laptop': Calculator,
  'Code': Calculator, 'Database': Calculator, 'Monitor': Calculator, 'Cpu': Calculator,
  'Brain': BookOpen, 'Lightbulb': BookOpen, 'GraduationCap': GraduationCap,
  'Book': BookOpen, 'Flag': Flag
};

export const colorMap: Record<string, string> = {
  'blue': 'from-blue-500 to-blue-600', 'purple': 'from-purple-500 to-purple-600',
  'green': 'from-green-500 to-green-600', 'orange': 'from-orange-500 to-orange-600',
  'indigo': 'from-indigo-500 to-indigo-600', 'red': 'from-red-500 to-red-600',
  'teal': 'from-teal-500 to-teal-600', 'emerald': 'from-emerald-500 to-emerald-600',
  'amber': 'from-amber-500 to-amber-600', 'cyan': 'from-cyan-500 to-cyan-600',
  'rose': 'from-rose-500 to-rose-600', 'pink': 'from-pink-500 to-pink-600',
  'slate': 'from-slate-500 to-slate-600'
};
