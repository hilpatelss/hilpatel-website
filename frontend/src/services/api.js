/**
 * ==============================================================================
 * Backend API Client Service (api.js)
 * ==============================================================================
 * 
 * WHAT IS THIS FILE?
 * This file is the "messenger" between our React frontend website and the 
 * Python Django backend server. Whenever React needs information (like the list 
 * of projects, skills, or site settings) or needs to send information (like when 
 * someone submits the contact form), it calls the functions in this file.
 * 
 * HOW DOES IT WORK?
 * It uses the standard web `fetch()` command to send HTTP requests across the internet 
 * to the Django REST Framework API at `https://api.hilpatel.site/api/v1`.
 */

// The base web address where our Django API server lives.
// If VITE_API_URL is set in environment files (like .env.production), it uses that;
// otherwise, it defaults to the live production server.
const rawBaseUrl = import.meta.env.VITE_API_URL || 'https://api.hilpatel.site/api/v1';
// Removes any trailing slashes from the URL (e.g., "example.com/" becomes "example.com")
const BASE_URL = rawBaseUrl.replace(/\/+$/, '');

/**
 * Core helper function that sends a network request to the backend.
 * 
 * @param {string} endpoint - The specific API path, like '/projects/' or '/skills/'
 * @param {Object} options - Custom settings like HTTP method (GET, POST), headers, or request body
 * @returns {Promise<Object>} - The JSON data received back from the backend
 */
async function request(endpoint, options = {}) {
  // Ensure the endpoint path begins with a leading slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;

  const config = {
    // 'no-cache' ensures that when the site owner updates information in the Django admin panel,
    // visitors will see the updated content immediately rather than stale cached copies.
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Perform the actual network fetch call
  const response = await fetch(url, config);

  // If the server answered with an error status (like 404 Not Found or 500 Server Error):
  if (!response.ok) {
    let errorData = null;
    try {
      // Try to parse error details sent back by Django
      errorData = await response.json();
    } catch (e) {
      // If the error response was not JSON, fall back to the generic HTTP status text
      errorData = { detail: response.statusText };
    }
    // Create a clear Error object so caller functions know exactly what went wrong
    const error = new Error(errorData?.error || errorData?.detail || `HTTP Error ${response.status}`);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  // If the server answered successfully (HTTP 200 OK), parse and return the JSON data
  return response.json();
}

/**
 * Public API object grouping all backend requests used by the website.
 */
export const api = {
  // 1. Consolidated initial bootstrap endpoint
  // Instead of making 10 separate API calls on startup, this single call downloads
  // site settings, design tokens, projects, skills, education, and stats in one bundle!
  getBootstrap: () => request('/site-settings/bootstrap/'),

  // 2. Individual Site Settings & Appearance endpoints
  getSiteSettings: () => request('/site-settings/'),
  getDesignSettings: () => request('/site-settings/design/'),
  getNavigation: () => request('/site-settings/navigation/'),
  getSections: () => request('/site-settings/sections/'),

  // 3. Portfolio Content endpoints
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

  // 4. Projects endpoints
  getProjects: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/projects/${query ? `?${query}` : ''}`);
  },
  getProjectDetail: (slug) => request(`/projects/${slug}/`),
  getProjectCategories: () => request('/projects/categories/'),

  // 5. Contact Form submission endpoint
  // Sends the visitor's name, email, and message to Django so it can be saved in the database
  // and optionally emailed to the site owner.
  submitContact: async (payload) => {
    try {
      return await request('/contact/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      // Fallback: If the API was deployed under an older URL pattern without '/v1',
      // try sending it to the legacy '/contact/' endpoint before giving up.
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


