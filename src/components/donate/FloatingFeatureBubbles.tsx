const shapes = [
  "9999px",
  "12px",
  "8px",
  "30% 70% 70% 30% / 30% 30% 70% 70%",
  "50%",
  "70% 30% 30% 70% / 60% 40% 60% 40%",
  "16px",
  "40% 60% 50% 50% / 50% 50% 60% 40%",
];

const bubbles = [
  { label: "IA Personnalisée", left: "3%", duration: "18s", delay: "0s", shape: 0, size: "sm" },
  { label: "200 Gdes/mois", left: "12%", duration: "22s", delay: "3s", shape: 1, size: "xs" },
  { label: "Système Gold", left: "24%", duration: "16s", delay: "7s", shape: 2, size: "base" },
  { label: "Multilingue", left: "38%", duration: "25s", delay: "1s", shape: 3, size: "sm" },
  { label: "Examens Officiels", left: "52%", duration: "20s", delay: "10s", shape: 4, size: "xs" },
  { label: "Découvre ta Passion", left: "66%", duration: "28s", delay: "5s", shape: 5, size: "sm" },
  { label: "Messagerie", left: "78%", duration: "17s", delay: "12s", shape: 6, size: "base" },
  { label: "Fil d'Actualité", left: "88%", duration: "23s", delay: "8s", shape: 7, size: "xs" },
  { label: "Classement", left: "33%", duration: "19s", delay: "14s", shape: 0, size: "sm" },
  { label: "Développement Personnel", left: "58%", duration: "26s", delay: "2s", shape: 1, size: "xs" },
  { label: "Quiz Interactif", left: "8%", duration: "21s", delay: "6s", shape: 2, size: "base" },
  { label: "Tableau de Bord", left: "45%", duration: "24s", delay: "9s", shape: 3, size: "sm" },
  { label: "Certificats", left: "72%", duration: "15s", delay: "4s", shape: 4, size: "xs" },
  { label: "Forum", left: "18%", duration: "27s", delay: "11s", shape: 5, size: "base" },
  { label: "Mode Hors-ligne", left: "82%", duration: "19s", delay: "13s", shape: 6, size: "sm" },
  { label: "Exercices", left: "48%", duration: "22s", delay: "0s", shape: 7, size: "xs" },
  { label: "Leçons Vidéo", left: "28%", duration: "16s", delay: "8s", shape: 0, size: "sm" },
  { label: "Progression", left: "62%", duration: "20s", delay: "15s", shape: 1, size: "base" },
];

const sizeClasses: Record<string, string> = {
  xs: "text-xs px-3 py-1",
  sm: "text-sm px-4 py-1.5",
  base: "text-base px-5 py-2",
};

export function FloatingFeatureBubbles() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {bubbles.map((b, i) => (
        <span
          key={i}
          className={`absolute bg-primary/25 text-primary/70 border border-primary/20 whitespace-nowrap animate-float-up font-medium ${sizeClasses[b.size]}`}
          style={{
            left: b.left,
            animationDuration: b.duration,
            animationDelay: b.delay,
            borderRadius: shapes[b.shape],
          }}
        >
          {b.label}
        </span>
      ))}
    </div>
  );
}
