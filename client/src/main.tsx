import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// Use relative path instead of alias for testing
import { ThemeProvider } from "./components/ui/theme-provider";


createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="theme-preference">
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
