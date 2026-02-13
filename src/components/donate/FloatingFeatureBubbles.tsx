const bubbles = [
  { label: "IA Personnalisée", left: "5%", duration: "18s", delay: "0s" },
  { label: "200 Gdes/mois", left: "15%", duration: "22s", delay: "3s" },
  { label: "Système Gold", left: "28%", duration: "16s", delay: "7s" },
  { label: "Multilingue", left: "42%", duration: "25s", delay: "1s" },
  { label: "Examens Officiels", left: "55%", duration: "20s", delay: "10s" },
  { label: "Découvre ta Passion", left: "68%", duration: "28s", delay: "5s" },
  { label: "Messagerie", left: "78%", duration: "17s", delay: "12s" },
  { label: "Fil d'Actualité", left: "88%", duration: "23s", delay: "8s" },
  { label: "Classement", left: "35%", duration: "19s", delay: "14s" },
  { label: "Développement Personnel", left: "60%", duration: "26s", delay: "2s" },
];

export function FloatingFeatureBubbles() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {bubbles.map((b, i) => (
        <span
          key={i}
          className="absolute bg-primary/10 text-primary/15 text-xs px-3 py-1 rounded-full whitespace-nowrap animate-float-up"
          style={{
            left: b.left,
            animationDuration: b.duration,
            animationDelay: b.delay,
          }}
        >
          {b.label}
        </span>
      ))}
    </div>
  );
}
