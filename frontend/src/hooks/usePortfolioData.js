import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

// Safe presentation fallbacks preserving original Hil Patel identity
const DEFAULT_FALLBACKS = {
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
    accent_color: "#10b981",
    accent2_color: "#06b6d4",
    dark_bg: "#0a0d14",
    dark_surface: "#111726",
    dark_surface2: "#172033",
    dark_text: "#f8fafc",
    dark_muted: "#94a3b8",
    dark_line: "#1e293b",
    light_bg: "#f8fafc",
    light_surface: "#ffffff",
    light_surface2: "#f1f5f9",
    light_text: "#0f172a",
    light_muted: "#64748b",
    light_line: "#e2e8f0",
    light_accent: "#059669",
    font_family_main: "'Manrope', sans-serif",
    font_family_mono: "'DM Mono', monospace",
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
      detail: "Undergraduate degree in Computer Engineering.",
      badge_text: "COMPLETED",
    },
    {
      degree: "Diploma in Engineering",
      field_of_study: "Computer Engineering",
      institution: "SSP · Gujarat Technological University (GTU)",
      year_display: "2023",
      detail: "Diploma in Computer Engineering.",
      badge_text: "COMPLETED",
    },
  ],
  certifications: [
    {
      title: "Data Analytics Certification",
      issuer: "Adani Skills & Development Center",
      category_name: "Data Analytics",
      status_text: "Listed on resume",
      credential_url: "",
    },
    {
      title: "Python / Django / Web Development",
      issuer: "Moltech Solutions Pvt. Ltd.",
      category_name: "Development",
      status_text: "Listed on resume",
      credential_url: "",
    },
  ],
  achievements: [
    {
      achievement_number: "01",
      title: "Interactive BI dashboards",
      description: "Built Power BI dashboards with KPI cards, slicers, DAX measures, and analytical visuals.",
      icon_name: "BarChart3",
    },
    {
      achievement_number: "02",
      title: "Data cleaning & EDA",
      description: "Explored datasets to identify patterns and trends across demographic and behavioural dimensions.",
      icon_name: "Search",
    },
    {
      achievement_number: "03",
      title: "End-to-end analytics",
      description: "Combined Python, SQL, and Power BI across projects, connecting data processing to reporting.",
      icon_name: "Database",
    },
  ],
  projects: [
    {
      number: "01",
      title: "Digital Wellbeing Analytics",
      category_name: "Power BI",
      repository_url: "https://github.com/hilpatelss/Digital-Wellbeing-Dashboard",
      tags: ["Power BI", "Excel", "DAX", "EDA"],
      short_description: "An interactive dashboard exploring smartphone usage and digital wellbeing across focus score, screen time, notifications, phone unlocks, stress, and high-risk users.",
      highlights: [
        "KPI cards for key wellbeing indicators",
        "Interactive charts, DAX measures, and slicers",
        "Trend analysis across gender, region, education, and device type",
      ],
      custom_art_type: "kpi_bars",
      icon_name: "BarChart3",
    },
    {
      number: "02",
      title: "BMI & Health Risk Analytics",
      category_name: "Power BI",
      repository_url: "https://github.com/hilpatelss/BMI-Analysis-Dashboard",
      tags: ["Power BI", "Excel", "DAX", "EDA"],
      short_description: "A health analytics dashboard examining BMI, body fat, weight, calorie intake, and risk patterns through interactive visuals.",
      highlights: [
        "KPI cards for BMI, height, weight, body fat, and calories",
        "Slicers, stacked bars, pie charts, line charts, treemaps, and Sankey diagrams",
        "Exploration across age, activity, BMI class, and risk level",
      ],
      custom_art_type: "donut_chart",
      icon_name: "ChartNoAxesCombined",
    },
    {
      number: "03",
      title: "Smart Bill Management System",
      category_name: "Full-stack",
      repository_url: "",
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
};

export function usePortfolioData() {
  const [data, setData] = useState(DEFAULT_FALLBACKS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const applyDesignTokens = (design, themeMode = 'dark') => {
    if (!design) return;
    const root = document.documentElement;

    if (design.accent_color) root.style.setProperty('--accent', design.accent_color);
    if (design.accent2_color) root.style.setProperty('--accent2', design.accent2_color);

    if (themeMode === 'light') {
      if (design.light_bg) root.style.setProperty('--bg', design.light_bg);
      if (design.light_surface) root.style.setProperty('--surface', design.light_surface);
      if (design.light_surface2) root.style.setProperty('--surface2', design.light_surface2);
      if (design.light_text) root.style.setProperty('--text', design.light_text);
      if (design.light_muted) root.style.setProperty('--muted', design.light_muted);
      if (design.light_line) root.style.setProperty('--line', design.light_line);
      if (design.light_accent) root.style.setProperty('--accent', design.light_accent);
    } else {
      if (design.dark_bg) root.style.setProperty('--bg', design.dark_bg);
      if (design.dark_surface) root.style.setProperty('--surface', design.dark_surface);
      if (design.dark_surface2) root.style.setProperty('--surface2', design.dark_surface2);
      if (design.dark_text) root.style.setProperty('--text', design.dark_text);
      if (design.dark_muted) root.style.setProperty('--muted', design.dark_muted);
      if (design.dark_line) root.style.setProperty('--line', design.dark_line);
    }

    if (design.font_family_main) root.style.setProperty('font-family', design.font_family_main);
    if (design.border_radius) root.style.setProperty('--radius', design.border_radius);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Parallel fetch of bootstrap and content
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

      const resolved = { ...DEFAULT_FALLBACKS };

      if (bootstrap.status === 'fulfilled' && bootstrap.value) {
        if (bootstrap.value.site) {
          resolved.site = { ...DEFAULT_FALLBACKS.site, ...bootstrap.value.site };
        }
        if (bootstrap.value.design) {
          resolved.design = { ...DEFAULT_FALLBACKS.design, ...bootstrap.value.design };
        }
        if (Array.isArray(bootstrap.value.navigation)) {
          resolved.navigation = bootstrap.value.navigation;
        }
        if (Array.isArray(bootstrap.value.sections)) {
          resolved.sections = bootstrap.value.sections;
        }
        if (Array.isArray(bootstrap.value.hero_metrics)) {
          resolved.hero_metrics = bootstrap.value.hero_metrics;
        }
      }

      // Dynamic data mapping from Django CMS (preserves fallback only if API request failed)
      if (projects.status === 'fulfilled') {
        const projectItems = Array.isArray(projects.value)
          ? projects.value
          : (projects.value?.results || []);
        resolved.projects = projectItems;
      }

      if (skills.status === 'fulfilled') {
        const skillItems = Array.isArray(skills.value)
          ? skills.value
          : (skills.value?.results || []);
        resolved.skills = skillItems;
      }

      if (education.status === 'fulfilled') {
        const eduItems = Array.isArray(education.value)
          ? education.value
          : (education.value?.results || []);
        resolved.education = eduItems;
      }

      if (certifications.status === 'fulfilled') {
        const certItems = Array.isArray(certifications.value)
          ? certifications.value
          : (certifications.value?.results || []);
        resolved.certifications = certItems;
      }

      if (achievements.status === 'fulfilled') {
        const achItems = Array.isArray(achievements.value)
          ? achievements.value
          : (achievements.value?.results || []);
        resolved.achievements = achItems;
      }

      if (ticker.status === 'fulfilled') {
        const tickerItems = Array.isArray(ticker.value)
          ? ticker.value
          : (ticker.value?.results || []);
        resolved.ticker = tickerItems.map((t) => (typeof t === 'string' ? t : t.text || ''));
      }

      if (aboutStats.status === 'fulfilled') {
        const statItems = Array.isArray(aboutStats.value)
          ? aboutStats.value
          : (aboutStats.value?.results || []);
        resolved.about_stats = statItems;
      }

      setData(resolved);
      const currentTheme = document.documentElement.dataset.theme || 'dark';
      applyDesignTokens(resolved.design, currentTheme);

      const allRejected = [
        bootstrap,
        projects,
        skills,
        education,
        certifications,
        achievements,
        ticker,
        aboutStats,
      ].every((res) => res.status === 'rejected');

      if (allRejected) {
        console.warn("Django API unreachable, continuing with fallback portfolio data.");
        setError(new Error("Backend API unreachable"));
      }
    } catch (err) {
      console.warn("Failed to reach Django API, using presentation fallbacks:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, error, refetch: loadData, applyDesignTokens };
}

