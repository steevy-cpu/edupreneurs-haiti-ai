import { memo, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
import { faqItems } from "@/data/homePageData";

/**
 * FAQ accordion section.
 * Local state only - no global state pollution.
 * Uses CSS max-height for smooth animations.
 */
export const FAQSection = memo(function FAQSection() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = useCallback((index: number) => {
    setExpandedFaq(prev => prev === index ? null : index);
  }, []);

  return (
    <section id="faq" className="relative py-12 sm:py-16 md:py-20 px-4 bg-gradient-to-b from-background to-primary/5 overflow-visible">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="container mx-auto max-w-3xl">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-8 sm:mb-12">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 text-primary">
              Questions fréquentes
            </h2>
            <p className="text-muted-foreground font-medium">
              Tout ce que vous devez savoir sur EDUPRENEURS
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="w-32 sm:w-40 md:w-48 h-32 sm:h-40 md:h-48 flex items-center justify-center animate-float relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20" />
              <HelpCircle className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 text-primary relative z-10" />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {faqItems.map((faq, idx) => (
            <Card 
              key={idx} 
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-primary/20 hover:border-primary/40 hover:scale-[1.02] bg-gradient-to-r from-card to-card/50" 
              onClick={() => toggleFaq(idx)}
            >
              <CardHeader>
                <CardTitle className="text-lg flex justify-between items-center font-bold">
                  <span className="group-hover:text-primary transition-colors">
                    {faq.q}
                  </span>
                  <span className={`text-2xl transition-transform duration-300 ${expandedFaq === idx ? 'rotate-180' : ''}`}>
                    {expandedFaq === idx ? '−' : '+'}
                  </span>
                </CardTitle>
              </CardHeader>
              {/* CSS animated content height */}
              <div 
                className={`overflow-hidden transition-all duration-300 ease-out ${
                  expandedFaq === idx ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <CardContent className="pt-0">
                  <p className="text-muted-foreground font-medium leading-relaxed">
                    {faq.a}
                  </p>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
});

export default FAQSection;
