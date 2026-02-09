/**
 * Translate Page
 * 
 * Public multi-language translator supporting:
 * - English, Haitian Creole, French, Spanish
 * 
 * Features:
 * - No authentication required
 * - Mobile-first responsive design
 * - 3G optimized (lazy loaded, minimal JS)
 * - Accessible (ARIA labels, keyboard navigation)
 */

import { useState, useCallback } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Footer } from "@/components/Footer";
import {
  TranslateHeader,
  LanguageSelector,
  TranslateTextArea,
  SwapLanguagesButton,
  TranslateButton,
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
  const { translate, isLoading, error, result, clearError } = useTranslation();

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
          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Traducteur Multilingue
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Anglais • Créole • Français • Espagnol
            </p>
          </div>

          {/* Translation Card */}
          <Card className="shadow-lg">
            <CardContent className="p-4 sm:p-6 space-y-4">
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
              <div className="flex justify-center">
                <TranslateButton
                  onClick={handleTranslate}
                  isLoading={isLoading}
                  disabled={!inputText.trim()}
                />
              </div>

              {/* Result Text Area */}
              {(result || isLoading) && (
                <TranslateTextArea
                  id="output-text"
                  label="Traduction"
                  value={isLoading ? "" : result}
                  placeholder={isLoading ? "Traduction en cours..." : "La traduction apparaîtra ici..."}
                  readOnly
                  showCopy
                />
              )}
            </CardContent>
          </Card>

          {/* Info Text */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            Propulsé par l'IA • Orthographe créole officielle
          </p>
        </main>

        <Footer />
      </div>
    </>
  );
}
