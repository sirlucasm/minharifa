"use client";
import { useEffect, useState, useCallback } from "react";

const useWindowScreen = () => {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [isClientLoading, setIsClientLoading] = useState(true);

  const handleWindowSizeChange = useCallback(() => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  }, []);

  const handleClientLoading = useCallback(
    () => setIsClientLoading(typeof window === "undefined"),
    []
  );

  useEffect(() => {
    handleClientLoading();
  }, [handleClientLoading]);

  useEffect(() => {
    handleWindowSizeChange();
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, [handleWindowSizeChange]);

  return {
    width,
    height,
    isMobile: width < 768,
    isDesktop: width >= 768,
    isClientLoading,
  };
};

export default useWindowScreen;
