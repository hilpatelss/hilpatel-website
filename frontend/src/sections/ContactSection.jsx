import React, { useState } from 'react';
import {
  Linkedin,
  Github,
  BriefcaseBusiness,
  Send,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';

export function ContactSection({ site, sectionConfig }) {
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' });
  const [formState, setFormState] = useState('idle'); // idle | sending | success | error
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
              {site.email} <ExternalLink size={14} />
            </a>
          )}

          <div className="contact-socials">
            {site?.linkedin_url && (
              <a href={site.linkedin_url} target="_blank" rel="noreferrer">
                <Linkedin size={18} /> LinkedIn
              </a>
            )}
            {site?.github_url && (
              <a href={site.github_url} target="_blank" rel="noreferrer">
                <Github size={18} /> GitHub
              </a>
            )}
            <span>
              <BriefcaseBusiness size={18} /> {site?.contact_availability_status || 'Open to entry-level roles'}
            </span>
          </div>
        </div>

        <form className="contact-form reveal" onSubmit={handleSubmit}>
          <div className="form-title">
            <span>LET'S START A CONVERSATION</span>
            <Send size={18} />
          </div>

          {/* Honeypot field for anti-spam (hidden from real users) */}
          <div style={{ display: 'none' }} aria-hidden="true">
            <label htmlFor="hp_website">Leave this field blank</label>
            <input
              id="hp_website"
              name="website"
              tabIndex="-1"
              autoComplete="off"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />
          </div>

          <label>
            Your name
            <input
              required
              minLength={2}
              maxLength={120}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Name"
              disabled={formState === 'sending'}
            />
          </label>

          <label>
            Email address
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              disabled={formState === 'sending'}
            />
          </label>

          <label>
            Message
            <textarea
              required
              minLength={10}
              maxLength={4000}
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="What would you like to discuss?"
              disabled={formState === 'sending'}
            />
          </label>

          <button
            className="button button-primary form-submit"
            type="submit"
            disabled={formState === 'sending'}
          >
            {formState === 'sending' ? 'Sending…' : 'Send message'}{' '}
            <ArrowRight size={16} />
          </button>

          {formState === 'success' && (
            <p className="form-feedback success">
              Message sent successfully! Thanks for reaching out.
            </p>
          )}

          {formState === 'error' && (
            <p className="form-feedback error">
              {errorMessage || (
                <>
                  The contact API is not reachable yet. Please email{' '}
                  <a href={`mailto:${site?.email || 'hilpatelss@gmail.com'}`}>
                    {site?.email || 'hilpatelss@gmail.com'}
                  </a>.
                </>
              )}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}

