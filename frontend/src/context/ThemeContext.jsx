import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Always default to clean, high-contrast, corporate light theme
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    try {
      // Force clean light theme and clear any stale dark setting
      document.documentElement.setAttribute("data-theme", "light");
      document.body.classList.remove("dark-theme");
      localStorage.setItem("gsc_theme", "light");
    } catch (e) {
      console.warn("Theme storage error:", e);
    }
  }, []);

  const toggleTheme = () => {
    setTheme("light");
  };

  return (
    <ThemeContext.Provider value={{ theme: "light", toggleTheme, isDark: false }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: "light",
      toggleTheme: () => {},
      isDark: false,
    };
  }
  return context;
}
