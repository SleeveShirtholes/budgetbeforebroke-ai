import { useState, useEffect } from "react";

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  screenWidth: number;
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouchDevice: false,
    screenWidth: 1024,
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const screenWidth = window.innerWidth;
      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;

      // Mobile: <= 768px
      // Tablet: 769px - 1024px
      // Desktop: > 1024px
      const isMobile = screenWidth <= 768;
      const isTablet = screenWidth > 768 && screenWidth <= 1024;
      const isDesktop = screenWidth > 1024;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice,
        screenWidth,
      });
    };

    // Initial detection
    updateDeviceInfo();

    // Listen for resize events
    window.addEventListener("resize", updateDeviceInfo);

    return () => {
      window.removeEventListener("resize", updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}
