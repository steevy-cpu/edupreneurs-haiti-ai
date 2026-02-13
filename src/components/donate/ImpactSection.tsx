import { Server, BookOpen } from "lucide-react";

const impactCards = [
  {
    icon: Server,
    title: "Technologie",
    description: "Maintenir les serveurs et développer la plateforme pour une expérience rapide et fiable.",
  },
  {
    icon: BookOpen,
    title: "Contenu éducatif",
    description: "Créer des leçons, quiz et activités adaptés au programme scolaire haïtien.",
  },
];

export function ImpactSection() {
  return (
    <section className="py-12 px-4 bg-background">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-foreground mb-8">
          Où va votre don? 💡
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {impactCards.map((card) => (
            <div
              key={card.title}
              className="bg-card border border-border rounded-xl p-6 text-center space-y-3"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <card.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{card.title}</h3>
              <p className="text-sm text-muted-foreground">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
