/**
 * ==============================================================================
 * Contact Section Component (ContactSection.jsx)
 * ==============================================================================
 */

import React, { useState } from 'react';
import {
  Linkedin,
  Github,
  Send,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { api } from '../services/api';
import { usePortfolio } from '../context/PortfolioContext';

export function ContactSection({ sectionConfig }) {
  const { data } = usePortfolio();
  const { site } = data;

  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' });
  const [formState, setFormState] = useState('idle'); // 'idle' | 'sending' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const indexLabel = sectionConfig?.index_label || "07 / CONTACT";
  const titleLine1 = sectionConfig?.title_line1 || "Have a role or";
  const titleLine2 = sectionConfig?.title_line2 || "project in mind";

  async function handleSubmit(e) {
    e.preventDefault();
    setFormState('sending');
    setErrorMessage('');

    try {
      await api.submitContact(form);
      setFormState('success');
      setForm({ name: '', email: '', message: '', website: '' });
    } catch (err) {
      setFormState('error');
      if (err.data?.details) {
        const detailsList = Object.entries(err.data.details)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`)
          .join(', ');
        setErrorMessage(detailsList);
      } else if (err.data?.error) {
        setErrorMessage(err.data.error);
      } else {
        setErrorMessage('The contact service could not be reached. Please email directly or try again later.');
      }
    }
  }

  return (
    <section className="contact-section" id="contact">
      <div className="section-wrap contact-layout">
        <div className="contact-copy reveal">
          <span className="section-index">{indexLabel}</span>
          <h2>
            {titleLine1}
            <br />
            {titleLine2}
            <span className="accent-dot">?</span>
          </h2>

          <p>{site?.contact_pitch}</p>

          {site?.email && (
            <a className="contact-email" href={`mailto:${site.email}`}>
              {site.email} <ExternalLink size={14} aria-hidden="true" />
            </a>
          )}

          <div className="contact-socials">
            {site?.linkedin_url && (
              <a href={site.linkedin_url} target="_blank" rel="noreferrer" aria-label="LinkedIn profile">
                <Linkedin size={18} aria-hidden="true" /> LinkedIn
              </a>
            )}
            {site?.github_url && (
              <a href={site.github_url} target="_blank" rel="noreferrer" aria-label="GitHub profile">
                <Github size={18} aria-hidden="true" /> GitHub
              </a>
            )}
          </div>

          <div className="contact-status-card">
            <span className="live-pill">
              <i aria-hidden="true" /> STATUS
            </span>
            <strong>{site?.contact_availability_status || 'Open to entry-level roles'}</strong>
            <small>{site?.location || 'Gujarat, India'} · Remote / Hybrid</small>
          </div>
        </div>

        <div className="contact-form-wrap reveal">
          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <span className="form-title">SEND AN INQUIRY</span>

            {/* Anti-spam honeypot */}
            <input
              type="text"
              name="website"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              style={{ display: 'none' }}
              tabIndex="-1"
              autoComplete="off"
            />

            <label>
              <span>NAME</span>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                disabled={formState === 'sending'}
              />
            </label>

            <label>
              <span>EMAIL</span>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="your.email@example.com"
                disabled={formState === 'sending'}
              />
            </label>

            <label>
              <span>MESSAGE</span>
              <textarea
                required
                rows="4"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell me about the role, project, or question..."
                disabled={formState === 'sending'}
              />
            </label>

            {formState === 'success' && (
              <div className="form-feedback success" role="alert">
                <CheckCircle2 size={18} aria-hidden="true" />
                <span>Message sent successfully! I will reply shortly.</span>
              </div>
            )}

            {formState === 'error' && (
              <div className="form-feedback error" role="alert">
                <AlertCircle size={18} aria-hidden="true" />
                <span>{errorMessage || 'Failed to send message. Please email directly.'}</span>
              </div>
            )}

            <button
              type="submit"
              className="button button-primary"
              disabled={formState === 'sending' || !form.name || !form.email || !form.message}
            >
              {formState === 'sending' ? (
                <>
                  <Loader2 size={16} className="spin" aria-hidden="true" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send message</span>
                  <Send size={15} aria-hidden="true" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
