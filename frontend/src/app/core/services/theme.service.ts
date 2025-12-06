import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Theme {
  id: string;
  name: string;
  displayName: string;
  primary: string;
  secondary: string;
  accent: string;
  warn: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  isDark: boolean;
}

export interface CustomColors {
  primary: string;
  secondary: string;
  accent: string;
  warn: string;
  success: string;
  info: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
}

export interface FontSettings {
  family: string;
  size: 'small' | 'medium' | 'large';
  weight: 'light' | 'normal' | 'medium' | 'bold';
}

export interface LayoutSettings {
  containerMaxWidth: string;
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  spacing: 'compact' | 'normal' | 'comfortable';
  cardStyle: 'flat' | 'raised' | 'outlined';
}

export interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  focusIndicators: boolean;
}

export interface ThemeSettings {
  currentTheme: string;
  customColors?: CustomColors;
  fontSettings: FontSettings;
  layoutSettings: LayoutSettings;
  accessibilitySettings: AccessibilitySettings;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'nebulamart_theme_settings';
  
  private currentThemeSubject = new BehaviorSubject<Theme>(this.getDefaultTheme());
  private themeSettingsSubject = new BehaviorSubject<ThemeSettings>(this.getDefaultSettings());
  
  public currentTheme$ = this.currentThemeSubject.asObservable();
  public themeSettings$ = this.themeSettingsSubject.asObservable();

  private availableThemes: Theme[] = [
    {
      id: 'nebula-light',
      name: 'nebula-light',
      displayName: 'NebulaMart Light',
      primary: '#ff7043',
      secondary: '#42a5f5',
      accent: '#ffc107',
      warn: '#f44336',
      background: '#fafafa',
      surface: '#ffffff',
      textPrimary: '#212121',
      textSecondary: '#757575',
      isDark: false
    },
    {
      id: 'nebula-dark',
      name: 'nebula-dark',
      displayName: 'NebulaMart Dark',
      primary: '#ff7043',
      secondary: '#42a5f5',
      accent: '#ffc107',
      warn: '#f44336',
      background: '#121212',
      surface: '#1e1e1e',
      textPrimary: '#ffffff',
      textSecondary: '#b3b3b3',
      isDark: true
    },
    {
      id: 'ocean-breeze',
      name: 'ocean-breeze',
      displayName: 'Ocean Breeze',
      primary: '#0277bd',
      secondary: '#4fc3f7',
      accent: '#26a69a',
      warn: '#f44336',
      background: '#f5f5f5',
      surface: '#ffffff',
      textPrimary: '#212121',
      textSecondary: '#757575',
      isDark: false
    },
    {
      id: 'sunset-glow',
      name: 'sunset-glow',
      displayName: 'Sunset Glow',
      primary: '#e65100',
      secondary: '#ff9800',
      accent: '#ff5722',
      warn: '#f44336',
      background: '#fff3e0',
      surface: '#ffffff',
      textPrimary: '#bf360c',
      textSecondary: '#8d6e63',
      isDark: false
    },
    {
      id: 'forest-green',
      name: 'forest-green',
      displayName: 'Forest Green',
      primary: '#2e7d32',
      secondary: '#66bb6a',
      accent: '#8bc34a',
      warn: '#f44336',
      background: '#f1f8e9',
      surface: '#ffffff',
      textPrimary: '#1b5e20',
      textSecondary: '#558b2f',
      isDark: false
    },
    {
      id: 'midnight-purple',
      name: 'midnight-purple',
      displayName: 'Midnight Purple',
      primary: '#7b1fa2',
      secondary: '#9c27b0',
      accent: '#e1bee7',
      warn: '#f44336',
      background: '#1a1a2e',
      surface: '#16213e',
      textPrimary: '#eee2ff',
      textSecondary: '#b39ddb',
      isDark: true
    },
    {
      id: 'high-contrast',
      name: 'high-contrast',
      displayName: 'High Contrast',
      primary: '#000000',
      secondary: '#ffffff',
      accent: '#ffff00',
      warn: '#ff0000',
      background: '#ffffff',
      surface: '#ffffff',
      textPrimary: '#000000',
      textSecondary: '#333333',
      isDark: false
    }
  ];

  constructor() {
    this.loadSavedSettings();
    this.initializeTheme();
  }

  private getDefaultTheme(): Theme {
    return this.availableThemes[0]; // nebula-light
  }

  private getDefaultSettings(): ThemeSettings {
    return {
      currentTheme: 'nebula-light',
      fontSettings: {
        family: 'Roboto',
        size: 'medium',
        weight: 'normal'
      },
      layoutSettings: {
        containerMaxWidth: '1200px',
        borderRadius: 'medium',
        spacing: 'normal',
        cardStyle: 'raised'
      },
      accessibilitySettings: {
        highContrast: false,
        reducedMotion: false,
        largeText: false,
        focusIndicators: true
      }
    };
  }

  private loadSavedSettings(): void {
    try {
      const savedSettings = localStorage.getItem(this.STORAGE_KEY);
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        this.themeSettingsSubject.next({ ...this.getDefaultSettings(), ...settings });
      }
    } catch (error) {
      console.error('Failed to load theme settings:', error);
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.themeSettingsSubject.value));
    } catch (error) {
      console.error('Failed to save theme settings:', error);
    }
  }

  private initializeTheme(): void {
    const settings = this.themeSettingsSubject.value;
    const theme = this.getThemeById(settings.currentTheme);
    if (theme) {
      this.applyTheme(theme, settings);
    }

    // Detect system theme preference
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        if (settings.currentTheme === 'auto') {
          const theme = e.matches ? this.getThemeById('nebula-dark') : this.getThemeById('nebula-light');
          if (theme) {
            this.applyTheme(theme, settings);
          }
        }
      });
    }
  }

  getAvailableThemes(): Theme[] {
    return [...this.availableThemes];
  }

  getThemeById(id: string): Theme | null {
    return this.availableThemes.find(theme => theme.id === id) || null;
  }

  setTheme(themeId: string): void {
    const theme = this.getThemeById(themeId);
    if (!theme) return;

    const settings = { ...this.themeSettingsSubject.value };
    settings.currentTheme = themeId;
    
    this.themeSettingsSubject.next(settings);
    this.currentThemeSubject.next(theme);
    this.applyTheme(theme, settings);
    this.saveSettings();
  }

  setCustomColors(colors: Partial<CustomColors>): void {
    const settings = { ...this.themeSettingsSubject.value };
    const currentColors = settings.customColors || {} as CustomColors;
    const updatedColors = { ...currentColors, ...colors } as CustomColors;
    settings.customColors = updatedColors;
    
    this.themeSettingsSubject.next(settings);
    this.applyCustomColors(updatedColors);
    this.saveSettings();
  }

  setFontSettings(fontSettings: Partial<FontSettings>): void {
    const settings = { ...this.themeSettingsSubject.value };
    settings.fontSettings = { ...settings.fontSettings, ...fontSettings };
    
    this.themeSettingsSubject.next(settings);
    this.applyFontSettings(settings.fontSettings);
    this.saveSettings();
  }

  setLayoutSettings(layoutSettings: Partial<LayoutSettings>): void {
    const settings = { ...this.themeSettingsSubject.value };
    settings.layoutSettings = { ...settings.layoutSettings, ...layoutSettings };
    
    this.themeSettingsSubject.next(settings);
    this.applyLayoutSettings(settings.layoutSettings);
    this.saveSettings();
  }

  setAccessibilitySettings(accessibilitySettings: Partial<AccessibilitySettings>): void {
    const settings = { ...this.themeSettingsSubject.value };
    settings.accessibilitySettings = { ...settings.accessibilitySettings, ...accessibilitySettings };
    
    this.themeSettingsSubject.next(settings);
    this.applyAccessibilitySettings(settings.accessibilitySettings);
    this.saveSettings();
  }

  toggleDarkMode(): void {
    const currentSettings = this.themeSettingsSubject.value;
    const currentTheme = this.currentThemeSubject.value;
    
    if (currentTheme.isDark) {
      this.setTheme('nebula-light');
    } else {
      this.setTheme('nebula-dark');
    }
  }

  resetToDefaults(): void {
    const defaultSettings = this.getDefaultSettings();
    this.themeSettingsSubject.next(defaultSettings);
    
    const theme = this.getThemeById(defaultSettings.currentTheme);
    if (theme) {
      this.currentThemeSubject.next(theme);
      this.applyTheme(theme, defaultSettings);
    }
    
    this.saveSettings();
  }

  exportSettings(): string {
    return JSON.stringify(this.themeSettingsSubject.value, null, 2);
  }

  importSettings(settingsJson: string): boolean {
    try {
      const settings = JSON.parse(settingsJson);
      
      // Validate settings structure
      if (this.validateSettings(settings)) {
        this.themeSettingsSubject.next({ ...this.getDefaultSettings(), ...settings });
        
        const theme = this.getThemeById(settings.currentTheme);
        if (theme) {
          this.currentThemeSubject.next(theme);
          this.applyTheme(theme, settings);
        }
        
        this.saveSettings();
        return true;
      }
    } catch (error) {
      console.error('Failed to import settings:', error);
    }
    
    return false;
  }

  private validateSettings(settings: any): boolean {
    // Basic validation of settings structure
    return settings && 
           typeof settings === 'object' &&
           settings.fontSettings &&
           settings.layoutSettings &&
           settings.accessibilitySettings;
  }

  private applyTheme(theme: Theme, settings: ThemeSettings): void {
    const root = document.documentElement;
    
    // Apply theme colors
    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--secondary-color', theme.secondary);
    root.style.setProperty('--accent-color', theme.accent);
    root.style.setProperty('--warn-color', theme.warn);
    root.style.setProperty('--background-color', theme.background);
    root.style.setProperty('--surface-color', theme.surface);
    root.style.setProperty('--text-primary-color', theme.textPrimary);
    root.style.setProperty('--text-secondary-color', theme.textSecondary);
    
    // Apply theme class to body
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '')
      .trim() + ` theme-${theme.id}`;

    // Apply other settings
    this.applyFontSettings(settings.fontSettings);
    this.applyLayoutSettings(settings.layoutSettings);
    this.applyAccessibilitySettings(settings.accessibilitySettings);
    
    // Apply custom colors if they exist
    if (settings.customColors) {
      this.applyCustomColors(settings.customColors);
    }
  }

  private applyCustomColors(colors: CustomColors): void {
    const root = document.documentElement;
    
    Object.entries(colors).forEach(([key, value]) => {
      if (value) {
        root.style.setProperty(`--custom-${key}`, value);
      }
    });
  }

  private applyFontSettings(fontSettings: FontSettings): void {
    const root = document.documentElement;
    
    // Apply font family
    root.style.setProperty('--font-family', fontSettings.family);
    
    // Apply font sizes
    const sizeMap = {
      small: { base: '13px', h1: '1.8rem', h2: '1.5rem', h3: '1.3rem' },
      medium: { base: '14px', h1: '2rem', h2: '1.6rem', h3: '1.4rem' },
      large: { base: '16px', h1: '2.2rem', h2: '1.8rem', h3: '1.5rem' }
    };
    
    const sizes = sizeMap[fontSettings.size];
    root.style.setProperty('--base-font-size', sizes.base);
    root.style.setProperty('--h1-font-size', sizes.h1);
    root.style.setProperty('--h2-font-size', sizes.h2);
    root.style.setProperty('--h3-font-size', sizes.h3);
    
    // Apply font weight
    const weightMap = {
      light: '300',
      normal: '400',
      medium: '500',
      bold: '700'
    };
    root.style.setProperty('--base-font-weight', weightMap[fontSettings.weight]);
  }

  private applyLayoutSettings(layoutSettings: LayoutSettings): void {
    const root = document.documentElement;
    
    // Apply container max width
    root.style.setProperty('--container-max-width', layoutSettings.containerMaxWidth);
    
    // Apply border radius
    const radiusMap = {
      none: '0',
      small: '4px',
      medium: '8px',
      large: '16px'
    };
    root.style.setProperty('--border-radius', radiusMap[layoutSettings.borderRadius]);
    
    // Apply spacing
    const spacingMap = {
      compact: '0.5rem',
      normal: '1rem',
      comfortable: '1.5rem'
    };
    root.style.setProperty('--base-spacing', spacingMap[layoutSettings.spacing]);
    
    // Apply card style class
    document.body.className = document.body.className
      .replace(/card-style-\w+/g, '')
      .trim() + ` card-style-${layoutSettings.cardStyle}`;
  }

  private applyAccessibilitySettings(accessibilitySettings: AccessibilitySettings): void {
    const body = document.body;
    
    // High contrast
    if (accessibilitySettings.highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }
    
    // Reduced motion
    if (accessibilitySettings.reducedMotion) {
      body.classList.add('reduced-motion');
    } else {
      body.classList.remove('reduced-motion');
    }
    
    // Large text
    if (accessibilitySettings.largeText) {
      body.classList.add('large-text');
    } else {
      body.classList.remove('large-text');
    }
    
    // Focus indicators
    if (accessibilitySettings.focusIndicators) {
      body.classList.add('focus-indicators');
    } else {
      body.classList.remove('focus-indicators');
    }
  }

  // Utility methods for theme detection
  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  getCurrentSettings(): ThemeSettings {
    return this.themeSettingsSubject.value;
  }

  isDarkMode(): boolean {
    return this.currentThemeSubject.value.isDark;
  }

  isHighContrast(): boolean {
    return this.themeSettingsSubject.value.accessibilitySettings.highContrast;
  }

  // Color utility methods
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  lightenColor(hex: string, percent: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;
    
    const factor = percent / 100;
    const newR = Math.round(rgb.r + (255 - rgb.r) * factor);
    const newG = Math.round(rgb.g + (255 - rgb.g) * factor);
    const newB = Math.round(rgb.b + (255 - rgb.b) * factor);
    
    return this.rgbToHex(newR, newG, newB);
  }

  darkenColor(hex: string, percent: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;
    
    const factor = percent / 100;
    const newR = Math.round(rgb.r * (1 - factor));
    const newG = Math.round(rgb.g * (1 - factor));
    const newB = Math.round(rgb.b * (1 - factor));
    
    return this.rgbToHex(newR, newG, newB);
  }

  getContrastRatio(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 1;
    
    const lum1 = this.getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = this.getLuminance(rgb2.r, rgb2.g, rgb2.b);
    
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }

  private getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }
}