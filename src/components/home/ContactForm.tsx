import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNetworkAwareAnimations } from '@/hooks/useNetworkAwareAnimations';

const contactFormSchema = z.object({
  name: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  email: z.string()
    .email("Veuillez entrer une adresse email valide")
    .max(255, "L'email ne peut pas dépasser 255 caractères"),
  message: z.string()
    .min(10, "Le message doit contenir au moins 10 caractères")
    .max(2000, "Le message ne peut pas dépasser 2000 caractères"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();
  const { shouldAnimate, shouldShowFloatingReactions } = useNetworkAwareAnimations();

  // Auto-reset success state after 4 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      const { data: responseData, error } = await supabase.functions.invoke(
        'submit-contact-form',
        {
          body: data,
        }
      );

      if (error) {
        throw error;
      }

      if (responseData?.success) {
        // Trigger confetti on fast networks only
        if (shouldShowFloatingReactions) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b']
          });
        }
        
        setShowSuccess(true);
        form.reset();
        
        toast({
          title: "Message envoyé !",
          description: "Nous vous répondrons sous 24 heures.",
        });
      } else {
        throw new Error(responseData?.error || 'Erreur inconnue');
      }
    } catch (error: unknown) {
      console.error('Contact form error:', error);
      
      // Check for rate limit error
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as { message: string }).message;
        if (errorMessage.includes('429') || errorMessage.includes('rate')) {
          toast({
            title: "Limite atteinte",
            description: "Veuillez patienter quelques minutes avant de renvoyer un message.",
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        {showSuccess ? (
          <div className={`text-center space-y-4 py-8 ${shouldAnimate ? 'animate-scale-in' : ''}`}>
            <div className="w-16 h-16 mx-auto rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle2 className={`w-10 h-10 text-success ${shouldAnimate ? 'animate-bounce' : ''}`} />
            </div>
            <h3 className="text-xl font-semibold text-foreground">
              Message envoyé !
            </h3>
            <p className="text-muted-foreground">
              Merci de nous avoir contactés. Nous vous répondrons sous 24 heures.
            </p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Envoyez-nous un message
            </h3>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Votre nom"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="votre@email.com"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Votre message..."
                          className="min-h-[120px] resize-none"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Envoyer le message
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <p className="text-sm text-muted-foreground mt-4 text-center">
              Nous vous répondrons sous 24 heures.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
