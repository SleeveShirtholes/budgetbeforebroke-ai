"use client";

import { useState, useEffect } from "react";

export type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

const COOKIE_CONSENT_KEY = "budgetbeforebroke_cookie_consent";
const COOKIE_PREFERENCES_KEY = "budgetbeforebroke_cookie_preferences";

export function useCookieConsent() {
  const [hasConsented, setHasConsented] = useState<boolean | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, required for basic functionality
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already given consent
    const consentStatus = localStorage.getItem(COOKIE_CONSENT_KEY);
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);

    if (consentStatus) {
      setHasConsented(consentStatus === "true");
      setShowBanner(false);
    } else {
      setShowBanner(true);
    }

    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(parsed);
      } catch (error) {
        console.error("Error parsing cookie preferences:", error);
      }
    }
  }, []);

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    
    setPreferences(allAccepted);
    setHasConsented(true);
    setShowBanner(false);
    
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(allAccepted));
  };

  const acceptNecessaryOnly = () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    
    setPreferences(necessaryOnly);
    setHasConsented(true);
    setShowBanner(false);
    
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(necessaryOnly));
  };

  const updatePreferences = (newPreferences: CookiePreferences) => {
    const finalPreferences = {
      ...newPreferences,
      necessary: true, // Always keep necessary cookies enabled
    };
    
    setPreferences(finalPreferences);
    setHasConsented(true);
    setShowBanner(false);
    
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(finalPreferences));
  };

  const resetConsent = () => {
    setHasConsented(null);
    setShowBanner(true);
    setPreferences({
      necessary: true,
      analytics: false,
      marketing: false,
    });
    
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    localStorage.removeItem(COOKIE_PREFERENCES_KEY);
  };

  return {
    hasConsented,
    showBanner,
    preferences,
    acceptAll,
    acceptNecessaryOnly,
    updatePreferences,
    resetConsent,
  };
}