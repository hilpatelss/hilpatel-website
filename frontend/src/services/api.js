const rawBaseUrl = import.meta.env.VITE_API_URL || 'https://api.hilpatel.site/api/v1';
const BASE_URL = rawBaseUrl.replace(/\/+$/, '');

async function request(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;
  const config = {
    // Avoid caching dynamic CMS content so admin updates appear on refresh
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { detail: response.statusText };
    }
    const error = new Error(errorData?.error || errorData?.detail || `HTTP Error ${response.status}`);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  return response.json();
}

export const api = {
  // Consolidated initial bootstrap payload
  getBootstrap: () => request('/site-settings/bootstrap/'),

  // Site Settings & Appearance
  getSiteSettings: () => request('/site-settings/'),
  getDesignSettings: () => request('/site-settings/design/'),
  getNavigation: () => request('/site-settings/navigation/'),
  getSections: () => request('/site-settings/sections/'),

  // Portfolio Content
  getTicker: () => request('/ticker/'),
  getAboutStats: () => request('/about-stats/'),
  getSkills: () => request('/skills/'),
  getEducation: () => request('/education/'),
  getCertifications: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/certifications/${query ? `?${query}` : ''}`);
  },
  getCertificationCategories: () => request('/certification-categories/'),
  getAchievements: () => request('/achievements/'),

  // Projects
  getProjects: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/projects/${query ? `?${query}` : ''}`);
  },
  getProjectDetail: (slug) => request(`/projects/${slug}/`),
  getProjectCategories: () => request('/projects/categories/'),

  // Contact Form
  submitContact: async (payload) => {
    try {
      return await request('/contact/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      // Fallback to legacy route if needed
      if (err.status === 404) {
        const legacyBase = BASE_URL.replace('/v1', '');
        const res = await fetch(`${legacyBase}/contact/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to submit contact');
        return res.json();
      }
      throw err;
    }
  },
};

