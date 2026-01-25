import { memo } from "react";
import { Rss } from "lucide-react";
import { BlogSection } from "@/components/blog/BlogSection";

/**
 * Blog section wrapper with heading and BlogSection component.
 */
export const BlogSectionWrapper = memo(function BlogSectionWrapper() {
  return (
    <section id="blog" className="py-12 md:py-20 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm font-semibold text-primary mb-4">
            <Rss className="w-4 h-4" />
            <span>Actualités & Conseils</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-4">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Notre Blog
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez nos articles sur l'éducation, des conseils d'apprentissage et les dernières nouvelles d'EDUPRENEURS.
          </p>
        </div>
        <BlogSection limit={3} />
      </div>
    </section>
  );
});

export default BlogSectionWrapper;
