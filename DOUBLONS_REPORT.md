# Doublons détectés — src/assets/ vs public/images/
Date: 2026-04-20
⚠️ AUCUN fichier supprimé. Ce rapport est READ-ONLY — Steeve décide.

## Fichiers en doublon (même nom de base, présents dans les deux dossiers)

| Fichier | src/assets/ | public/images/ | Utilisé depuis |
|---------|------------|----------------|----------------|
| edupreneurs-new-logo | .png (876KB) + .webp (créé) | .png (876KB) + .webp existant | Voir ci-dessous |
| eric-ai-helper | .png (2.76MB) + .webp (créé) | .png (2.76MB) + .webp existant | Voir ci-dessous |
| eric-celebrating | .png (2.63MB) + .webp (créé) | .png (2.63MB) + .webp existant | Voir ci-dessous |
| eric-right-pointing | .png (2.63MB) + .webp (créé) | .png (2.63MB) + .webp existant | Voir ci-dessous |
| jude-passion-discovery | .png (2.62MB) + .webp (créé) | .png (2.62MB) + .webp existant | Voir ci-dessous |
| jude-profile | src: absent | .png (1.41MB) + .webp existant | Voir ci-dessous |


## Usages détectés par grep

### edupreneurs-new-logo
```
src/auth/layout/AuthHeader.tsx:11:const edupreneursLogo = "/images/edupreneurs-new-logo.png";
src/components/Footer.tsx:3:import edupreneursLogo from "@/assets/edupreneurs-new-logo.png";
src/components/home/HeaderNav.tsx:7:import edupreneursLogo from "@/assets/edupreneurs-new-logo.png";
src/components/shared/HeroSkeleton.tsx:3:import edupreneursLogo from "@/assets/edupreneurs-new-logo.png";
src/pages/Blog.tsx:10:import edupreneursLogo from "@/assets/edupreneurs-new-logo.png";
src/pages/BlogPost.tsx:22:import edupreneursLogo from "@/assets/edupreneurs-new-logo.png";
src/pages/ResetPassword.tsx:14:const edupreneursLogo = "/images/edupreneurs-new-logo.png";
src/pages/ResetPassword.tsx:15:const edupreneursLogoWebP = "/images/edupreneurs-new-logo.webp";
src/shell/components/AppSidebar.tsx:49:const edupreneursLogo = '/images/edupreneurs-new-logo.png';
```

### eric-ai-helper
```
src/components/community/JudeBanner.tsx:2:const ericAiHelper = "/images/eric-ai-helper.png";
src/components/community/JudeTypingIndicator.tsx:5:const ericAiHelper = "/images/eric-ai-helper.png";
src/components/course/AIPracticeSection.tsx:8:const judeAiHelper = "/images/eric-ai-helper.png";
src/components/course/AIPracticeSection.tsx:9:const judeAiHelperWebP = "/images/eric-ai-helper.webp";
src/components/ebook/EbookJudeAssistant.tsx:11:const ericAiHelper = "/images/eric-ai-helper.png";
src/components/ebook/EbookJudeAssistant.tsx:12:const ericAiHelperWebP = "/images/eric-ai-helper.webp";
src/components/exam/BacDissertationChat.tsx:24:const ericAiHelper = "/images/eric-ai-helper.png";
src/components/exam/BacDissertationChat.tsx:25:const ericAiHelperWebP = "/images/eric-ai-helper.webp";
src/pages/Community.tsx:16:const ericAiHelper = "/images/eric-ai-helper.png";
src/pages/Community.tsx:17:const ericAiHelperWebP = "/images/eric-ai-helper.webp";
```

### eric-celebrating
```
src/components/chess/ChessPostGameAnalysis.tsx:23:import ericCelebrating from '@/assets/eric-celebrating.png';
src/components/firsttime/FirstTimeUserTour.tsx:8:import ericCelebrating from "@/assets/eric-celebrating.png";
src/components/firsttime/OnboardingQuiz.tsx:33:import ericCelebrating from '@/assets/eric-celebrating.png';
src/components/home/HeroSection.tsx:2:import ericCelebrating from "@/assets/eric-celebrating.png";
src/components/quiz-battle/MultiplayerResults.tsx:19:import judeCelebrating from '@/assets/eric-celebrating.png';
src/pages/Index.tsx:9:import ericCelebratingWebp from "@/assets/eric-celebrating.webp";
src/pages/Index.tsx:10:import ericCelebratingPng from "@/assets/eric-celebrating.png";
src/pages/PassionDiscovery.tsx:39:import judeCelebrating from "@/assets/eric-celebrating.png";
```

### eric-right-pointing
```
src/pages/Matieres.tsx:100:        ericPointing: "/images/eric-right-pointing.png",
src/pages/Matieres.tsx:101:        ericPointingWebP: "/images/eric-right-pointing.webp"
```

### jude-passion-discovery
```
src/components/home/CoursesSection.tsx:126:                    src="/images/jude-passion-discovery.png"
src/pages/PassionDiscovery.tsx:45:import judePassionDiscovery from "@/assets/jude-passion-discovery.png";
```

### jude-profile
```
src/components/ebook/EbookJudeAssistant.tsx:8:import judeProfile from "@/assets/jude-profile.jpeg";
src/components/exam/ExamTutorChat.tsx:12:import judeProfile from "@/assets/jude-profile.jpeg";
src/features/exams/practice/components/AskJudeDrawer.tsx:32:import judeProfile from '@/assets/jude-profile.jpeg';
src/features/exams/practice/components/ExamResultsModal.tsx:11:import judeProfile from '@/assets/jude-profile.jpeg';
src/features/exams/practice/components/ExerciseHeader.tsx:10:import judeProfile from '@/assets/jude-profile.jpeg';
src/features/exams/practice/components/FeedbackCard.tsx:12:import judeProfile from '@/assets/jude-profile.jpeg';
src/lib/avatarMap.ts:4:import judeProfile from "@/assets/jude-profile.jpeg";
src/pages/ExamPreparation.tsx:19:import judeProfile from "@/assets/jude-profile.jpeg";
src/pages/Translate.tsx:22:import judeProfile from "@/assets/jude-profile.jpeg";
```

## Gain potentiel si doublons supprimés

Estimation: ~15-20 MB (PNG originaux des 5 fichiers dupliqués)

## Recommandation


### Contexte
- `src/assets/` → importés via Vite (ex: `import ericCelebrating from "@/assets/eric-celebrating.png"`), reçoivent un hash en prod (`/assets/eric-celebrating-abc123.png`)
- `public/images/` → servis statiquement à `/images/eric-celebrating.png`, utilisés dans `index.html` et la static HTML shell

### Suggestion (à valider par Steeve)
1. **edupreneurs-new-logo** : garder uniquement `public/images/` (déjà utilisé dans index.html static shell)
2. **eric-celebrating** : garder les deux — `src/assets/` pour HeroSection (import Vite), `public/images/` pour le preload index.html
3. **eric-ai-helper** : vérifier les usages ci-dessus, potentiellement unifier vers `public/images/`
4. **eric-right-pointing** : idem
5. **jude-passion-discovery** : idem

⚠️ NE PAS supprimer avant d'avoir identifié précisément lequel est référencé dans chaque composant.
