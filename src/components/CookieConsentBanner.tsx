"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, CogIcon } from "@heroicons/react/24/outline";
import Button from "./Button";
import Card from "./Card";
import {
  useCookieConsent,
  type CookiePreferences,
} from "@/hooks/useCookieConsent";

export default function CookieConsentBanner() {
  const {
    showBanner,
    preferences,
    acceptAll,
    acceptNecessaryOnly,
    updatePreferences,
  } = useCookieConsent();

  const [showPreferences, setShowPreferences] = useState(false);
  const [tempPreferences, setTempPreferences] =
    useState<CookiePreferences>(preferences);

  if (!showBanner) return null;

  const handleSavePreferences = () => {
    updatePreferences(tempPreferences);
    setShowPreferences(false);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === "necessary") return; // Can't disable necessary cookies

    setTempPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="max-w-7xl mx-auto">
            <Card className="shadow-2xl border-accent-300">
              <div className="p-4">
                {!showPreferences ? (
                  // Main consent banner
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                        We use cookies to enhance your experience
                      </h3>
                      <p className="text-secondary-600 text-sm">
                        We use cookies to provide essential functionality,
                        analyze usage, and improve your experience. You can
                        customize your preferences or accept all cookies to
                        continue.{" "}
                        <Button
                          variant="text"
                          href="/privacy"
                          className="text-sm p-0"
                        >
                          Learn more in our Privacy Policy
                        </Button>
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                      <Button
                        variant="text"
                        size="sm"
                        onClick={() => setShowPreferences(true)}
                        className="flex items-center gap-1"
                      >
                        <CogIcon className="w-4 h-4" />
                        Customize
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={acceptNecessaryOnly}
                      >
                        Necessary Only
                      </Button>
                      <Button variant="primary" size="sm" onClick={acceptAll}>
                        Accept All
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Detailed preferences panel
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-secondary-900">
                        Cookie Preferences
                      </h3>
                      <button
                        onClick={() => setShowPreferences(false)}
                        className="p-1 rounded-md hover:bg-accent-100 transition-colors"
                      >
                        <XMarkIcon className="w-5 h-5 text-secondary-500" />
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Necessary Cookies */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 mr-4">
                          <h4 className="font-medium text-secondary-900 mb-1">
                            Necessary Cookies
                          </h4>
                          <p className="text-sm text-secondary-600">
                            Essential for the website to function properly.
                            These cookies enable core functionality such as
                            security, network management, and accessibility.
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="relative inline-block w-12 h-6 bg-primary-600 rounded-full opacity-50">
                            <div className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow"></div>
                          </div>
                          <p className="text-xs text-secondary-500 mt-1">
                            Always On
                          </p>
                        </div>
                      </div>

                      {/* Analytics Cookies */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 mr-4">
                          <h4 className="font-medium text-secondary-900 mb-1">
                            Analytics Cookies
                          </h4>
                          <p className="text-sm text-secondary-600">
                            Help us understand how visitors interact with our
                            website by collecting and reporting information
                            anonymously.
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => togglePreference("analytics")}
                            className={`relative inline-block w-12 h-6 rounded-full transition-colors ${
                              tempPreferences.analytics
                                ? "bg-primary-600"
                                : "bg-accent-300"
                            }`}
                          >
                            <div
                              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                tempPreferences.analytics
                                  ? "translate-x-6"
                                  : "translate-x-0.5"
                              }`}
                            ></div>
                          </button>
                        </div>
                      </div>

                      {/* Marketing Cookies */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 mr-4">
                          <h4 className="font-medium text-secondary-900 mb-1">
                            Marketing Cookies
                          </h4>
                          <p className="text-sm text-secondary-600">
                            Used to track visitors across websites to display
                            relevant advertisements and measure campaign
                            effectiveness.
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => togglePreference("marketing")}
                            className={`relative inline-block w-12 h-6 rounded-full transition-colors ${
                              tempPreferences.marketing
                                ? "bg-primary-600"
                                : "bg-accent-300"
                            }`}
                          >
                            <div
                              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                tempPreferences.marketing
                                  ? "translate-x-6"
                                  : "translate-x-0.5"
                              }`}
                            ></div>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-accent-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTempPreferences({
                            necessary: true,
                            analytics: false,
                            marketing: false,
                          });
                        }}
                        fullWidth
                      >
                        Reject All
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setTempPreferences({
                            necessary: true,
                            analytics: true,
                            marketing: true,
                          });
                        }}
                        fullWidth
                      >
                        Accept All
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSavePreferences}
                        fullWidth
                      >
                        Save Preferences
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
