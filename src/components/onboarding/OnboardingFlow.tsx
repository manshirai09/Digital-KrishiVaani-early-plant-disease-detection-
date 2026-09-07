import React, { useState } from 'react';
import { SupportedLanguageCode, UserAccount } from '../../types';
import { I18nService } from '../../services/i18nService';
import { AuthService } from '../../services/authService';
import { LanguageSelectScreen } from './LanguageSelectScreen';
import { VaaniIntroScreen } from './VaaniIntroScreen';
import { TourCarouselScreen } from './TourCarouselScreen';
import { AuthVoiceScreen } from './AuthVoiceScreen';
import { FarmerSetupScreen } from './FarmerSetupScreen';

export type OnboardingStage =
  | 'language_selection'
  | 'auth'
  | 'product_tour'
  | 'vaani_intro'
  | 'farmer_setup';

interface OnboardingFlowProps {
  initialStage?: OnboardingStage;
  onComplete: (user?: UserAccount) => void;
  onCancel?: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  initialStage = 'language_selection',
  onComplete,
  onCancel
}) => {
  const [stage, setStage] = useState<OnboardingStage>(initialStage);
  const [authenticatedUser, setAuthenticatedUser] = useState<UserAccount | null>(() => {
    return AuthService.getAuthSession()?.user || null;
  });

  // Step 1: User Chooses Language -> Transitions to Step 2 (Login / Signup)
  const handleLanguageSelected = (code: SupportedLanguageCode) => {
    I18nService.setLanguage(code);

    // If user is already authenticated and just reopened language selector from UI
    const session = AuthService.getAuthSession();
    if (session?.user && localStorage.getItem('krishirakshak_onboarding_completed') === 'true') {
      onComplete(session.user);
      return;
    }

    // Sequence: First choose language, then login/signup
    setStage('auth');
  };

  // Step 2: User Logs in / Signs up -> Transitions to Step 3 (Demo Tour)
  const handleAuthSuccess = (user: UserAccount, isNewUser: boolean) => {
    setAuthenticatedUser(user);

    // Sequence: First choose language, then login/signup, then demo tour
    setStage('product_tour');
  };

  // Step 3: Demo Tour Completed or Skipped -> Step 4: Show Main UI
  const handleTourComplete = () => {
    try {
      localStorage.setItem('krishirakshak_onboarding_completed', 'true');
      localStorage.setItem('krishirakshak_tour_completed', 'true');
    } catch {}

    const session = AuthService.getAuthSession();
    const userToPass = authenticatedUser || session?.user || undefined;

    // Sequence: Then show UI!
    onComplete(userToPass);
  };

  const handleSetupComplete = () => {
    try {
      localStorage.setItem('krishirakshak_onboarding_completed', 'true');
    } catch {}
    onComplete(authenticatedUser || undefined);
  };

  return (
    <div id="master-onboarding-container" className="fixed inset-0 z-50 overflow-y-auto bg-slate-950">
      {/* 1. First: Choose Language */}
      {stage === 'language_selection' && (
        <LanguageSelectScreen onLanguageSelected={handleLanguageSelected} />
      )}

      {/* 2. Then: Login / Signup */}
      {stage === 'auth' && (
        <AuthVoiceScreen
          onAuthSuccess={handleAuthSuccess}
          onBackToLanguage={() => setStage('language_selection')}
          onBackToTour={() => setStage('language_selection')}
        />
      )}

      {/* 3. Then: Demo Tour */}
      {stage === 'product_tour' && (
        <TourCarouselScreen
          onComplete={handleTourComplete}
          onBackToAuth={() => setStage('auth')}
          onBackToIntro={() => setStage('auth')}
        />
      )}

      {/* Optional auxiliary intro if navigated directly */}
      {stage === 'vaani_intro' && (
        <VaaniIntroScreen
          onNext={() => setStage('auth')}
          onChangeLanguage={() => setStage('language_selection')}
        />
      )}

      {/* Optional auxiliary farm setup if navigated directly */}
      {stage === 'farmer_setup' && authenticatedUser && (
        <FarmerSetupScreen
          user={authenticatedUser}
          onComplete={handleSetupComplete}
        />
      )}
    </div>
  );
};

