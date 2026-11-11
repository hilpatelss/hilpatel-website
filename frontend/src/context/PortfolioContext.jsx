/**
 * ==============================================================================
 * Central Portfolio Data Provider (PortfolioContext.jsx)
 * ==============================================================================
 *
 * Coordinates parallel data fetching from Django REST endpoints:
 * - Parallel retrieval using Promise.allSettled
 * - Authentic presentation fallbacks during cold starts
 * - Dynamic design token injection into CSS Custom Properties
 * - Automatic background retries when server is waking up
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { useAPIReadiness } from './APIReadinessContext';
import { useTheme } from './ThemeContext';

export const DEFAULT_PORTFOLIO_DATA = {
  site: {
    site_title: "Hil Patel Portfolio / 2026",
    brand_mark_initial: "H",
    brand_mark_accent: ".",
    owner_name: "Hil Patel",
    professional_headline: "Data Analyst",
    location: "Gandhinagar, Gujarat, India",
    email: "hilpatelss@gmail.com",
    linkedin_url: "https://linkedin.com/in/hilpatelss",
    github_url: "https://github.com/hilpatelss",
    intro_text: "I turn raw data into clear insights and practical decisions.",
    summary_text: "Computer Engineering graduate with hands-on experience in data analysis, dashboard development, and business reporting. I work with Python, SQL, Excel, Power BI, and data visualization to make complex information easier to understand.",
    hero_eyebrow: "OPEN TO ENTRY-LEVEL OPPORTUNITIES",
    hero_kicker: "DATA ANALYTICS · BUSINESS INTELLIGENCE · PYTHON",
    hero_headline_greeting: "Hi, I'm Hil.",
    hero_headline_line1: "I make data",
    hero_headline_line2: "make sense",
    hero_primary_button_text: "Explore my work",
    hero_primary_button_url: "#projects",
    hero_secondary_button_text: "Download resume",
    hero_secondary_button_url: "/resume.pdf",
    about_large_copy: "I enjoy finding the signal in the noise — cleaning data, asking better questions, and turning analysis into something people can act on.",
    about_body_copy: "My work spans exploratory data analysis, interactive Power BI dashboards, and a Django-based billing system. I like connecting the technical details with the bigger business question: what does the data actually tell us?",
    footer_tagline: "Turning questions into insights,\none dataset at a time.",
    footer_copyright: "© 2026 Hil Patel. Built with intention.",
    footer_tech_stack: "REACT · DJANGO REST FRAMEWORK",
    footer_location: "GUJARAT, INDIA",
    contact_enabled: true,
    contact_availability_status: "Open to entry-level roles",
    contact_pitch: "I'm interested in entry-level Data Analyst opportunities and conversations about analytics, dashboards, and data-driven problem solving.",
  },
  design: {
    accent_color: "#2997FF",
    accent2_color: "#40A9FF",
    dark_bg: "#030507",
    dark_secondary: "#0c1017",
    dark_tertiary: "#121824",
    dark_surface: "#0c1017",
    dark_surface2: "#121824",
    dark_text: "#f8fafc",
    dark_muted: "#94a3b8",
    dark_line: "#1e293b",
    dark_card: "#0c1017",
    dark_input: "#121824",
    light_bg: "#FFFFFF",
    light_secondary: "#F8FAFC",
    light_tertiary: "#F1F5F9",
    light_surface: "#FFFFFF",
    light_surface2: "#F8FAFC",
    light_text: "#0F172A",
    light_muted: "#64748B",
    light_line: "#E2E8F0",
    light_accent: "#0071E3",
    light_accent_hover: "#0077ED",
    light_card: "#FFFFFF",
    light_input: "#F8FAFC",
    font_family_main: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', 'Helvetica Neue', Arial, sans-serif",
    font_family_mono: "'SF Mono', 'DM Mono', Menlo, Consolas, monospace",
  },
  navigation: [
    { label: "About", url: "#about" },
    { label: "Projects", url: "#projects" },
    { label: "Skills", url: "#skills" },
    { label: "Education", url: "#education" },
    { label: "Certifications", url: "#certifications" },
  ],
  hero_metrics: [
    { icon_name: "Code2", text: "Python · SQL · Power BI" },
    { icon_name: "GraduationCap", text: "Computer Engineering · 2026" },
  ],
  ticker: [
    "PYTHON", "SQL", "POWER BI", "EXCEL", "PANDAS", "DAX", "POSTGRESQL", "DATA STORYTELLING", "DATA CLEANING"
  ],
  about_stats: [
    { number: "03", label: "Featured projects", detail: "Dashboards & applications", is_accent: false },
    { number: "02", label: "Certifications", detail: "Listed in resume", is_accent: false },
    { number: "05+", label: "Tool categories", detail: "From Python to BI", is_accent: false },
    { number: "", label: "My focus", detail: "Useful insights, clear reporting", is_accent: true, icon_name: "ChartNoAxesCombined" },
  ],
  skills: [
    { name: "Languages", items: ["Python", "SQL"] },
    { name: "Data analysis", items: ["Pandas", "NumPy", "Data Cleaning", "Exploratory Data Analysis"] },
    { name: "Visualization", items: ["Power BI", "Excel", "Matplotlib", "DAX"] },
    { name: "Databases", items: ["PostgreSQL", "SQLite"] },
    { name: "Tools & development", items: ["Git", "GitHub", "VS Code", "Django", "REST APIs"] },
  ],
  education: [
    {
      degree: "Bachelor of Engineering",
      field_of_study: "Computer Engineering",
      institution: "SVBIT · Gujarat Technological University (GTU)",
      year_display: "2026",
      badge_text: "COMPLETED",
      detail: "Focused on core database structures, software engineering, and data science principles.",
    },
  ],
  certifications: [
    {
      title: "Google Data Analytics Professional Certificate",
      issuer: "Coursera · Google",
      category_name: "Data Analytics",
      credential_url: "https://coursera.org",
      issue_date_display: "2026",
      status_text: "VERIFIED CREDENTIAL",
    },
    {
      title: "Python for Everybody Specialization",
      issuer: "University of Michigan",
      category_name: "Python",
      credential_url: "https://coursera.org",
      issue_date_display: "2025",
      status_text: "VERIFIED CREDENTIAL",
    },
  ],
  achievements: [
    {
      achievement_number: "01",
      title: "Interactive BI Dashboards",
      description: "Designed executive dashboards turning complex multi-table operational data into actionable KPI summaries.",
      icon_name: "BarChart3",
    },
    {
      achievement_number: "02",
      title: "Data Pipeline Cleaning & EDA",
      description: "Implemented Python and Pandas pipelines to ingest, clean, and analyze high-volume records with zero null leaks.",
      icon_name: "Search",
    },
    {
      achievement_number: "03",
      title: "Smart Bill Management System",
      description: "Engineered full-stack Django and PostgreSQL application providing automated invoice tracking and billing insights.",
      icon_name: "Database",
    },
  ],
  projects: [
    {
      number: "01",
      title: "Digital Wellbeing & Usage Analytics",
      category_name: "Analytics",
      repository_url: "https://github.com/hilpatelss",
      tags: ["Python", "Power BI", "Pandas", "Data Cleaning"],
      short_description: "An exploratory data analysis and interactive Power BI dashboard examining daily device usage patterns and productivity correlations.",
      highlights: [
        "Uncovered usage spikes and notification distraction trends",
        "Interactive Power BI dashboard with cross-filtering",
        "Cleaned and prepared messy time-series logs using Pandas",
      ],
      custom_art_type: "kpi_bars",
      icon_name: "ChartNoAxesCombined",
    },
    {
      number: "02",
      title: "BMI & Health Risk Analysis Dashboard",
      category_name: "Visualization",
      repository_url: "https://github.com/hilpatelss",
      tags: ["Power BI", "Excel", "DAX", "Data Storytelling"],
      short_description: "A business intelligence dashboard visualizing health risk patterns across population demographics.",
      highlights: [
        "Demographic risk segmentation with customized DAX measures",
        "Clean, executive-level visual reporting layout",
        "Distribution analysis connecting metrics to risk factors",
      ],
      custom_art_type: "donut_chart",
      icon_name: "BarChart3",
    },
    {
      number: "03",
      title: "Smart Bill Management System",
      category_name: "Full-stack",
      repository_url: "https://github.com/hilpatelss",
      tags: ["Django", "PostgreSQL", "Python", "Power BI"],
      short_description: "A billing management system using Django and PostgreSQL, paired with Python-based analysis and Power BI reporting.",
      highlights: [
        "Billing and customer data analysis with Pandas",
        "Revenue, customer activity, and billing performance dashboards",
        "Backend development with Django and PostgreSQL",
      ],
      custom_art_type: "billing_chart",
      icon_name: "Database",
    },
  ],
  sections: [],
};

const PortfolioContext = createContext(null);

export function PortfolioProvider({ children }) {
  const [data, setData] = useState(DEFAULT_PORTFOLIO_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('pending');

  const readiness = useAPIReadiness();
  const { theme } = useTheme();

  const requestIdRef = useRef(0);
  const inFlightRef = useRef(false);
  const retryTimerRef = useRef(null);
  const isMountedRef = useRef(true);
  const loadDataRef = useRef();

  const clearRetry = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const scheduleRetry = useCallback((delay = 4000) => {
    clearRetry();
    if (!isMountedRef.current) return;
    retryTimerRef.current = setTimeout(() => {
      if (isMountedRef.current && !inFlightRef.current && loadDataRef.current) {
        loadDataRef.current();
      }
    }, delay);
  }, [clearRetry]);

  const applyDesignTokens = useCallback((design, themeMode) => {
    if (!design || typeof document === 'undefined') return;
    const root = document.documentElement;

    if (themeMode === 'light') {
      root.style.setProperty('--bg-primary', design.light_bg || '#FFFFFF');
      root.style.setProperty('--bg-secondary', design.light_secondary || '#F8FAFC');
      root.style.setProperty('--bg-tertiary', design.light_tertiary || '#F1F5F9');
      root.style.setProperty('--text-primary', design.light_text || '#0F172A');
      root.style.setProperty('--text-secondary', design.light_muted || '#64748B');
      root.style.setProperty('--border', design.light_line || '#E2E8F0');
      root.style.setProperty('--card-bg', design.light_card || '#FFFFFF');
      root.style.setProperty('--input-bg', design.light_input || '#F8FAFC');
      root.style.setProperty('--accent', design.light_accent || '#0071E3');
      root.style.setProperty('--accent-hover', design.light_accent_hover || '#0077ED');
    } else {
      root.style.setProperty('--bg-primary', design.dark_bg || '#030507');
      root.style.setProperty('--bg-secondary', design.dark_secondary || '#0C1017');
      root.style.setProperty('--bg-tertiary', design.dark_tertiary || '#121824');
      root.style.setProperty('--text-primary', design.dark_text || '#F8FAFC');
      root.style.setProperty('--text-secondary', design.dark_muted || '#94A3B8');
      root.style.setProperty('--border', design.dark_line || '#1E293B');
      root.style.setProperty('--card-bg', design.dark_card || '#0C1017');
      root.style.setProperty('--input-bg', design.dark_input || '#121824');
      root.style.setProperty('--accent', design.accent_color || '#2196FF');
      root.style.setProperty('--accent-hover', design.accent2_color || '#40A9FF');
    }
  }, []);

  const loadData = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    clearRetry();

    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    setApiStatus('pending');
    readiness.markApiLoading();

    try {
      const [
        bootstrap,
        projects,
        skills,
        education,
        certifications,
        achievements,
        ticker,
        aboutStats,
      ] = await Promise.allSettled([
        api.getBootstrap(),
        api.getProjects(),
        api.getSkills(),
        api.getEducation(),
        api.getCertifications(),
        api.getAchievements(),
        api.getTicker(),
        api.getAboutStats(),
      ]);

      if (currentRequestId !== requestIdRef.current) return;
      readiness.markApiValidating();

      const resolved = { ...DEFAULT_PORTFOLIO_DATA };

      if (bootstrap.status === 'fulfilled' && bootstrap.value) {
        if (bootstrap.value.site) resolved.site = { ...DEFAULT_PORTFOLIO_DATA.site, ...bootstrap.value.site };
        if (bootstrap.value.design) resolved.design = { ...DEFAULT_PORTFOLIO_DATA.design, ...bootstrap.value.design };
        if (Array.isArray(bootstrap.value.navigation)) resolved.navigation = bootstrap.value.navigation;
        if (Array.isArray(bootstrap.value.sections)) resolved.sections = bootstrap.value.sections;
        if (Array.isArray(bootstrap.value.hero_metrics)) resolved.hero_metrics = bootstrap.value.hero_metrics;
      }

      if (projects.status === 'fulfilled') {
        resolved.projects = Array.isArray(projects.value) ? projects.value : (projects.value?.results || []);
      }
      if (skills.status === 'fulfilled') {
        resolved.skills = Array.isArray(skills.value) ? skills.value : (skills.value?.results || []);
      }
      if (education.status === 'fulfilled') {
        resolved.education = Array.isArray(education.value) ? education.value : (education.value?.results || []);
      }
      if (certifications.status === 'fulfilled') {
        resolved.certifications = Array.isArray(certifications.value) ? certifications.value : (certifications.value?.results || []);
      }
      if (achievements.status === 'fulfilled') {
        resolved.achievements = Array.isArray(achievements.value) ? achievements.value : (achievements.value?.results || []);
      }
      if (ticker.status === 'fulfilled') {
        const rawTicker = Array.isArray(ticker.value) ? ticker.value : (ticker.value?.results || []);
        resolved.ticker = rawTicker.map((t) => (typeof t === 'string' ? t : t.text || ''));
      }
      if (aboutStats.status === 'fulfilled') {
        resolved.about_stats = Array.isArray(aboutStats.value) ? aboutStats.value : (aboutStats.value?.results || []);
      }

      setData(resolved);
      applyDesignTokens(resolved.design, theme);

      const hasLiveResponse = [
        bootstrap,
        projects,
        skills,
        education,
        certifications,
        achievements,
        ticker,
        aboutStats,
      ].some((r) => r.status === 'fulfilled' && r.value);

      if (!hasLiveResponse) {
        const fail = (bootstrap.status === 'rejected' && bootstrap.reason) ||
          new Error('Django REST API unavailable. Connecting in background...');
        setError(fail);
        setApiStatus('error');
        readiness.markApiError(fail);
        scheduleRetry(4000);
      } else {
        setError(null);
        setApiStatus('success');
        readiness.markApiReady();
        clearRetry();
      }
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) return;
      setError(err);
      setApiStatus('error');
      readiness.markApiError(err);
      scheduleRetry(4000);
    } finally {
      inFlightRef.current = false;
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [clearRetry, scheduleRetry, readiness, applyDesignTokens, theme]);

  loadDataRef.current = loadData;

  const refetch = useCallback(() => {
    clearRetry();
    inFlightRef.current = false;
    readiness.resetReadiness();
    return loadData();
  }, [clearRetry, loadData, readiness]);

  useEffect(() => {
    isMountedRef.current = true;
    loadData();

    return () => {
      isMountedRef.current = false;
      clearRetry();
    };
  }, [loadData, clearRetry]);

  useEffect(() => {
    if (data?.design) {
      applyDesignTokens(data.design, theme);
    }
  }, [theme, data?.design, applyDesignTokens]);

  const value = {
    data,
    loading,
    error,
    apiStatus,
    refetch,
    applyDesignTokens,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}

export default PortfolioProvider;
