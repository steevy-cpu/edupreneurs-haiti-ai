import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { teamMembers } from "@/data/homePageData";

/**
 * Team section with member cards.
 * Static content - memoized for performance.
 */
export const TeamSection = memo(function TeamSection() {
  return (
    <section id="team" className="py-12 sm:py-16 md:py-20 px-4 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary mb-3 sm:mb-4">
            L'équipe EDUPRENEURS
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Des passionnés dédiés à transformer l'éducation haïtienne
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
          {teamMembers.map((member, idx) => (
            <Card 
              key={idx} 
              className="group hover:scale-[1.02] transition-all duration-300 ease-out hover:shadow-lg border-0 bg-card text-center overflow-hidden"
            >
              <CardHeader className="pb-3 pt-8">
                {/* Stylized Initials Avatar */}
                <div className={`w-20 h-20 mx-auto rounded-lg bg-gradient-to-br ${member.color} flex items-center justify-center mb-4 group-hover:scale-105 group-hover:rotate-2 transition-all duration-300 ease-out shadow-lg`}>
                  <span className="text-2xl font-black text-white tracking-tight">
                    {member.initials}
                  </span>
                </div>
                <CardTitle className="text-xl font-bold text-foreground">
                  {member.name}
                </CardTitle>
                <CardDescription className="text-base font-semibold text-accent mt-1">
                  {member.role}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-8">
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {member.bio}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
});

export default TeamSection;
