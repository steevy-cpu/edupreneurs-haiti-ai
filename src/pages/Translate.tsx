/**
 * Translate Page
 * 
 * Jude-powered multi-language translator supporting:
 * - English, Haitian Creole, French, Spanish
 * 
 * Features:
 * - No authentication required
 * - Jude AI branding and personality
 * - Mobile-first responsive design
 * - 3G optimized (lazy loaded, minimal JS)
 * - Accessible (ARIA labels, keyboard navigation)
 * - Keyboard shortcut (Ctrl+Enter to translate)
 */

import { useState, useCallback } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Footer } from "@/components/Footer";
import judeProfile from "@/assets/jude-profile.jpeg";
import {
  TranslateHeader,
  LanguageSelector,
  TranslateTextArea,
  SwapLanguagesButton,
  TranslateButton,
  TranslateCTA,
  JudeTranslatingOverlay,
  useTranslation,
  DEFAULT_SOURCE_LANG,
  DEFAULT_TARGET_LANG,
} from "@/features/translate";
import type { LanguageCode } from "@/features/translate";

export default function Translate() {
  // Language state
  const [sourceLang, setSourceLang] = useState<LanguageCode>(DEFAULT_SOURCE_LANG);
  const [targetLang, setTargetLang] = useState<LanguageCode>(DEFAULT_TARGET_LANG);
  
  // Text state
  const [inputText, setInputText] = useState("");
  
  // Translation hook
  const { translate, isLoading, error, result, clearError, clearResult } = useTranslation();

  // Handle language swap
  const handleSwap = useCallback(() => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    // Also swap the texts if there's a result
    if (result) {
      setInputText(result);
    }
  }, [sourceLang, targetLang, result]);

  // Handle translation
  const handleTranslate = useCallback(() => {
    clearError();
    translate({
      text: inputText,
      sourceLang,
      targetLang,
    });
  }, [inputText, sourceLang, targetLang, translate, clearError]);

  // Handle keyboard shortcut (Ctrl+Enter or Cmd+Enter)
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (inputText.trim() && !isLoading) {
        handleTranslate();
      }
    }
  }, [inputText, isLoading, handleTranslate]);

  // Handle clear input
  const handleClear = useCallback(() => {
    setInputText("");
    clearResult();
    clearError();
  }, [clearResult, clearError]);

  // Handle source language change
  const handleSourceChange = (lang: LanguageCode) => {
    setSourceLang(lang);
    // If same as target, swap target to old source
    if (lang === targetLang) {
      setTargetLang(sourceLang);
    }
  };

  // Handle target language change
  const handleTargetChange = (lang: LanguageCode) => {
    setTargetLang(lang);
    // If same as source, swap source to old target
    if (lang === sourceLang) {
      setSourceLang(targetLang);
    }
  };

  return (
    <>
      <Helmet>
        <title>Traducteur | EDUPRENEURS - Anglais, Créole, Français, Espagnol</title>
        <meta 
          name="description" 
          content="Traduisez gratuitement entre l'anglais, le créole haïtien, le français et l'espagnol. Traducteur alimenté par l'IA pour les étudiants haïtiens." 
        />
        <meta name="keywords" content="traducteur, créole, haïtien, français, anglais, espagnol, Haiti, traduction gratuite" />
        <link rel="canonical" href="https://mon-edupreneur.com/translate" />
        <meta property="og:title" content="Traducteur EDUPRENEURS - Anglais, Créole, Français, Espagnol" />
        <meta property="og:description" content="Traduisez gratuitement entre 4 langues avec notre traducteur IA." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <TranslateHeader />
        
        <main className="flex-1 container max-w-screen-md mx-auto px-4 py-6 sm:py-8">
          {/* Title Section with Jude */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <img 
                src={judeProfile}
                alt="Jude"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-primary/20"
                loading="lazy"
                decoding="async"
              />
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Jude Traducteur
              </h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Votre assistant IA pour les traductions
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Anglais • Créole • Français • Espagnol
            </p>
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-4 sm:p-6 space-y-4">
              {/* Jude Welcome Message - only when no translation has been done */}
              {!result && !isLoading && (
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <img 
                    src={judeProfile}
                    alt="Jude"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20 shrink-0"
                    loading="lazy"
                    decoding="async"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Salut ! Je suis Jude 👋
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Entrez du texte et je le traduirai pour vous !
                    </p>
                  </div>
                </div>
              )}
              {/* Language Selectors */}
              <div className="flex items-end gap-2 sm:gap-4">
                <div className="flex-1">
                  <LanguageSelector
                    id="source-lang"
                    label="De"
                    value={sourceLang}
                    onChange={handleSourceChange}
                    disabledValue={targetLang}
                  />
                </div>
                
                <SwapLanguagesButton 
                  onSwap={handleSwap} 
                  disabled={isLoading} 
                />
                
                <div className="flex-1">
                  <LanguageSelector
                    id="target-lang"
                    label="Vers"
                    value={targetLang}
                    onChange={handleTargetChange}
                    disabledValue={sourceLang}
                  />
                </div>
              </div>

              {/* Input Text Area */}
              <TranslateTextArea
                id="input-text"
                label="Texte à traduire"
                value={inputText}
                onChange={setInputText}
                onClear={handleClear}
                onKeyDown={handleKeyDown}
                placeholder="Entrez le texte à traduire..."
              />

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error.message}</AlertDescription>
                </Alert>
              )}

              {/* Translate Button */}
              <div className="flex flex-col items-center gap-2">
                <TranslateButton
                  onClick={handleTranslate}
                  isLoading={isLoading}
                  disabled={!inputText.trim()}
                />
                <p className="text-xs text-muted-foreground text-center">
                  Appuyez sur{" "}
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Ctrl</kbd>
                  {" + "}
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Enter</kbd>
                  {" "}pour traduire
                </p>
              </div>

              {/* Jude Translating Overlay */}
              {isLoading && <JudeTranslatingOverlay isVisible={isLoading} />}

              {/* Result Text Area with Jude attribution */}
              {result && !isLoading && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <img 
                      src={judeProfile}
                      alt="Jude"
                      className="w-6 h-6 rounded-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <label className="text-sm font-medium text-foreground">
                      Traduction par Jude
                    </label>
                  </div>
                  <TranslateTextArea
                    id="output-text"
                    label=""
                    value={result}
                    placeholder="La traduction apparaîtra ici..."
                    readOnly
                    showCopy
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* CTA for unauthenticated users */}
          <TranslateCTA />

          {/* Info Text */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            Traduit par Jude, votre assistant IA • Orthographe créole officielle
          </p>
        </main>

        <Footer />
      </div>
    </>
  );
}
