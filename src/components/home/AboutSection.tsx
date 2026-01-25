import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { aboutPoints, visionPoints, getIcon } from "@/data/homePageData";

/**
 * About section with mission and vision cards.
 * Static markdown-like content.
 */
export const AboutSection = memo(function AboutSection() {
  return (
    <section id="about" className="relative py-20 px-4 bg-gradient-to-br from-background to-accent/5 overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-primary/10 rounded-full blur-2xl opacity-40" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/10 rounded-full blur-2xl opacity-40" />
      
      <div className="container mx-auto relative z-10">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-12 animate-fade-in">
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            À Propos d'EDUPRENEURS
          </span>
        </h2>
        
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left Column - Mission */}
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-primary">Notre Mission</h3>
            <blockquote className="text-foreground font-bold italic border-l-4 border-accent pl-4 py-2 bg-accent/5 rounded-r-lg">
              « L'éducation est l'arme la plus puissante pour transformer une nation » - Nelson Mandela
            </blockquote>
            <p className="text-muted-foreground leading-relaxed font-medium">
              En 2025, le système éducatif haïtien peine encore à répondre aux besoins du pays en matière d'efficacité. 
              Le pays se fait de plus en plus devancé au point de vue d'instruction par le biais technologique, 
              se trouvant totalement désuet dans ce monde dirigé par la technologie.
            </p>
            
            <h3 className="text-2xl font-black text-primary pt-4">Projet Phare 2025</h3>
            <p className="text-muted-foreground leading-relaxed font-medium">
              EDUPRENEURS est né d'une vision claire : <span className="font-black text-foreground bg-gradient-to-r from-primary/20 to-accent/20 px-2 py-1 rounded">révolutionner l'éducation haïtienne</span> en 
              mettant en place un système d'instruction entièrement basé sur le programme du Ministère de l'Éducation Nationale 
              et de la Formation Professionnelle (MENFP).
            </p>
            
            <div className="space-y-4 pt-4">
              {aboutPoints.map((point, idx) => (
                <Card 
                  key={idx} 
                  className="group hover:shadow-lg transition-all duration-300 ease-out hover:scale-[1.02] border-primary/20 hover:border-primary/40 bg-gradient-to-r from-card to-card/50"
                >
                  <CardContent className="p-4 flex gap-4">
                    <div className="group-hover:scale-105 transition-transform duration-300 ease-out flex-shrink-0">
                      {getIcon(point.iconName, "w-8 h-8 text-primary")}
                    </div>
                    <div>
                      <h4 className="font-black text-primary mb-1 text-base">{point.title}</h4>
                      <p className="text-sm text-muted-foreground font-medium leading-relaxed">{point.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Right Column - Vision */}
          <Card className="relative bg-gradient-to-br from-card via-primary/5 to-accent/10 shadow-xl border-2 border-primary/20 overflow-hidden group hover:shadow-2xl transition-all duration-500 ease-out">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" />
            <CardHeader className="relative z-10">
              <CardTitle className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Notre Vision pour Haïti
              </CardTitle>
              <CardDescription className="text-base font-medium leading-relaxed">
                Nous croyons fermement qu'avec les bonnes méthodes, le programme du MENFP qui est assez généraliste 
                pour certains a encore l'occasion d'impacter positivement l'avenir de notre pays.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              {visionPoints.map((item, idx) => (
                <div 
                  key={idx} 
                  className="group/item p-4 bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 rounded-xl border-l-4 border-accent hover:border-primary transition-all duration-300 hover:shadow-lg hover:translate-x-2"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {getIcon(item.iconName, "w-6 h-6 text-primary")}
                    </div>
                    <div>
                      <h4 className="font-black text-primary mb-2 text-base">{item.title}</h4>
                      <p className="text-sm text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
});

export default AboutSection;
