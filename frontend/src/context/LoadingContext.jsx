import React, { createContext, useContext, useState, useCallback } from 'react';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [activeRequests, setActiveRequests] = useState(0);

  const startLoading = useCallback(() => {
    setActiveRequests(prev => prev + 1);
  }, []);

  const stopLoading = useCallback(() => {
    setActiveRequests(prev => Math.max(0, prev - 1));
  }, []);

  const isLoading = activeRequests > 0;

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
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
