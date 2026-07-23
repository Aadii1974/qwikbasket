import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [activeRequests, setActiveRequests] = useState(0);
  const timeoutRef = useRef(null);

  const startLoading = useCallback(() => {
    setActiveRequests(prev => prev + 1);
  }, []);

  const stopLoading = useCallback(() => {
    setActiveRequests(prev => Math.max(0, prev - 1));
  }, []);

  const resetLoading = useCallback(() => {
    setActiveRequests(0);
  }, []);

  // Safety fallback: Never allow global loader to stay active for more than 2.5 seconds continuously
  useEffect(() => {
    if (activeRequests > 0) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setActiveRequests(0);
      }, 2500);
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [activeRequests]);

  const isLoading = activeRequests > 0;

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading, resetLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

