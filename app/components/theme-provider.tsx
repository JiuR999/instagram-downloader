"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { hexToHsl } from "../../lib/utils";

type ThemeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [mounted, setMounted] = useState(false);

  // 初始化：从 localStorage 读取或使用系统偏好
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme");
    const savedColor = localStorage.getItem("primaryColor");
    
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
    
    if (savedColor) {
      setPrimaryColor(savedColor);
    } else {
      // 初始化默认颜色的 CSS 变量
      const root = document.documentElement;
      const hsl = hexToHsl("#3b82f6");
      root.style.setProperty("--primary", hsl);
      const parts = hsl.split(" ");
      const h = parseInt(parts[0]);
      const s = parseInt(parts[1]);
      const l = parseFloat(parts[2]);
      root.style.setProperty("--primary-hover", `${h} ${s}% ${Math.max(0, l - 10)}%`);
      const foregroundL = l > 50 ? 10 : 98;
      root.style.setProperty("--primary-foreground", `${h} ${Math.min(s, 20)}% ${foregroundL}%`);
    }
  }, []);

  // 应用深色模式类
  useEffect(() => {
    if (!mounted) return;
    
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode, mounted]);

  // 更新主色调
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    const hsl = hexToHsl(primaryColor);
    root.style.setProperty("--primary", hsl);
    
    // 计算 hover 颜色（稍微变暗或变亮）
    const parts = hsl.split(" ");
    const h = parseInt(parts[0]);
    const s = parseInt(parts[1]);
    const l = parseFloat(parts[2]);
    const hoverL = isDarkMode ? Math.min(100, l + 10) : Math.max(0, l - 10);
    root.style.setProperty("--primary-hover", `${h} ${s}% ${hoverL}%`);
    
    // 计算前景色（根据主色调的亮度决定使用深色还是浅色文字）
    // 如果主色调较亮（>50%），使用深色文字；否则使用浅色文字
    const foregroundL = l > 50 ? 10 : 98; // 深色文字或浅色文字
    root.style.setProperty("--primary-foreground", `${h} ${Math.min(s, 20)}% ${foregroundL}%`);
    
    localStorage.setItem("primaryColor", primaryColor);
  }, [primaryColor, isDarkMode, mounted]);

  return (
    <ThemeContext.Provider value={{ 
      isDarkMode, 
      toggleDarkMode: () => setIsDarkMode(!isDarkMode), 
      primaryColor, 
      setPrimaryColor 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};