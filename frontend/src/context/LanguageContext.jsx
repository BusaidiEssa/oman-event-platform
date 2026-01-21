// Import necessary modules from React
import React, { createContext, useContext, useState } from 'react';

// Create a Context for managing language data throughout the app
const LanguageContext = createContext();

// LanguageProvider is a Context Provider component that wraps the app
export const LanguageProvider = ({ children }) => {
  // State to store the current language, defaulting to 'en' for English
  const [language, setLanguage] = useState('en');

  // Function to toggle the language between 'en' (English) and 'ar' (Arabic)
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  // Determine if the current language is set to Arabic (Right-to-Left)
  const isRTL = language === 'ar';

  // The direction of the text (left-to-right or right-to-left) 
  const dir = isRTL ? 'rtl' : 'ltr';

  return (
    // Providing context values (language, toggleLanguage, isRTL, dir) 
    // to all children components wrapped in LanguageProvider
    <LanguageContext.Provider value={{ language, toggleLanguage, isRTL, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to access the LanguageContext data (language and methods) in any React component
export const useLanguage = () => {
  // Retrieve the current context value, throwing an error if used outside the provider
  const context = useContext(LanguageContext);
  if (!context) {
    // Ensures the hook is used within the LanguageProvider
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
