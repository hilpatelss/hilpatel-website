/**
 * ==============================================================================
 * Contact & Inquiry Section (ContactSection.jsx) — Redesign 2.0
 * ==============================================================================
 *
 * WHAT IS THIS SECTION?
 * This is where visitors, recruiters, and hiring managers can reach out to Hil Patel.
 *
 * FEATURES & PRESERVATION:
 * 1. Direct Contact Details (Left Column):
 *    - Clickable email link (`hilpatelss@gmail.com`) with quick-copy support
 *    - LinkedIn and GitHub profile links
 *    - Career status badge ("Open to entry-level roles")
 * 2. Interactive Message Form (Right Column):
 *    - Form fields for Name, Email, and Message with character counter
 *    - Invisible "Honeypot" anti-spam trap (catches automated bots without CAPTCHAs)
 *    - Live submission states: disables button while sending, with clear confirmation.
 */
import React, { useState } from 'react';
import {
  Linkedin,
  Github,
  BriefcaseBusiness,
  Send,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Mail,
} from 'lucide-react';
import { api } from '../services/api';

export function ContactSection({ site, sectionConfig }) {
  // Form input field state (name, email, message, and secret honeypot 'website')
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' });
  // Form submission status: 'idle' | 'sending' | 'success' | 'error'
  const [formState, setFormState] = useState('idle');
  // Error message text if submission fails
  const [errorMessage, setErrorMessage] = useState('');
  // Email copy-to-clipboard state
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Configurable headings from Django CMS
  const indexLabel = sectionConfig?.index_label || "07 / CONTACT";
  const titleLine1 = sectionConfig?.title_line1 || "Have a role or";
  const rawTitleLine2 = sectionConfig?.title_line2 || "project in mind";
  // Clean trailing question marks from CMS title so exactly one styled accent question mark renders
  const titleLine2 = rawTitleLine2.replace(/\?+$/, '').trim();

  const handleCopyEmail = (e) => {
    e.preventDefault();
    const emailToCopy = site?.email || "hilpatelss@gmail.com";
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(emailToCopy);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2400);
    } else {
      window.location.href = `mailto:${emailToCopy}`;
    }
  };

  /**
   * Handles contact form submission when the user clicks "Send message".
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setFormState('sending');
    setErrorMessage('');

    try {
      // Send the inquiry to the Django backend
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
    <section className="section-block contact-section" id="contact" aria-label="Contact Hil Patel">
      <div className="section-wrap contact-layout">
        {/* Left Column: Direct email & Social profile links */}
        <div className="contact-copy reveal">
          <span className="section-index">{indexLabel}</span>
          <h2>
            {titleLine1}
            <br />
            {titleLine2}
            <span className="accent-dot" aria-hidden="true">?</span>
          </h2>

          <p className="contact-pitch-text">{site?.contact_pitch}</p>

          {/* Email row with quick-copy button */}
          {site?.email && (
            <div className="contact-email-row">
              <a className="contact-email" href={`mailto:${site.email}`}>
                <Mail size={16} aria-hidden="true" />
                <span>{site.email}</span>
                <ExternalLink size={13} aria-hidden="true" />
              </a>
              <button
                type="button"
                className="email-copy-btn"
                onClick={handleCopyEmail}
                aria-label={`Copy email ${site.email} to clipboard`}
                title="Copy email to clipboard"
              >
                {copiedEmail ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                <span>{copiedEmail ? "Copied" : "Copy"}</span>
              </button>
            </div>
          )}

          <div className="contact-socials" aria-label="Social profiles and career status">
            {site?.linkedin_url && (
              <a href={site.linkedin_url} target="_blank" rel="noopener noreferrer" className="contact-social-pill">
                <Linkedin size={17} aria-hidden="true" />
                <span>LinkedIn</span>
                <ExternalLink size={12} aria-hidden="true" />
              </a>
            )}
            {site?.github_url && (
              <a href={site.github_url} target="_blank" rel="noopener noreferrer" className="contact-social-pill">
                <Github size={17} aria-hidden="true" />
                <span>GitHub</span>
                <ExternalLink size={12} aria-hidden="true" />
              </a>
            )}
            <span className="contact-availability-pill">
              <BriefcaseBusiness size={16} aria-hidden="true" />
              <span>{site?.contact_availability_status || 'Open to entry-level roles'}</span>
            </span>
          </div>
        </div>

        {/* Right Column: Contact Inquiry Form */}
        <form className="contact-form reveal" onSubmit={handleSubmit} noValidate={false}>
          <div className="form-title">
            <span>LET'S START A CONVERSATION</span>
            <Send size={18} aria-hidden="true" />
          </div>

          {/* 
            ANTI-SPAM HONEYPOT TRAP:
            Hidden from human visitors. If bots fill this in, Django drops it immediately!
          */}
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

          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="contact_name">Your name</label>
            <input
              id="contact_name"
              required
              minLength={2}
              maxLength={120}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Jane Doe"
              disabled={formState === 'sending'}
            />
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="contact_email">Email address</label>
            <input
              id="contact_email"
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@company.com"
              disabled={formState === 'sending'}
            />
          </div>

          {/* Message Textarea with live character counter */}
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="contact_message">Message</label>
              <small className="char-count">{form.message.length}/4000</small>
            </div>
            <textarea
              id="contact_message"
              required
              minLength={10}
              maxLength={4000}
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="What would you like to discuss? (Roles, dashboards, datasets...)"
              disabled={formState === 'sending'}
            />
          </div>

          {/* Submit Button */}
          <button
            className="button button-primary form-submit"
            type="submit"
            disabled={formState === 'sending'}
          >
            <span>{formState === 'sending' ? 'Sending message…' : 'Send message'}</span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>

          {/* Confirmation Alert on Success */}
          {formState === 'success' && (
            <div className="form-feedback success" role="alert">
              <CheckCircle2 size={18} aria-hidden="true" />
              <span>Message sent successfully! Thanks for reaching out. Hil will get back to you shortly.</span>
            </div>
          )}

          {/* Error Notice on Failure */}
          {formState === 'error' && (
            <div className="form-feedback error" role="alert">
              <AlertCircle size={18} aria-hidden="true" />
              <span>
                {errorMessage || (
                  <>
                    The contact API is not reachable yet. Please email{' '}
                    <a href={`mailto:${site?.email || 'hilpatelss@gmail.com'}`}>
                      {site?.email || 'hilpatelss@gmail.com'}
                    </a>.
                  </>
                )}
              </span>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

export default ContactSection;
