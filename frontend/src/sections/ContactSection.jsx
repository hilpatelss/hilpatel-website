/**
 * ==============================================================================
 * Contact & Inquiry Section (ContactSection.jsx)
 * ==============================================================================
 *
 * WHAT IS THIS SECTION?
 * This is where visitors, recruiters, and hiring managers can reach out to Hil Patel.
 *
 * WHAT FEATURES DOES IT HAVE?
 * 1. Direct Contact Details (Left Column):
 *    - Clickable email link (`hilpatelss@gmail.com`)
 *    - LinkedIn and GitHub profile links
 *    - Career status badge ("Open to entry-level roles")
 * 2. Interactive Message Form (Right Column):
 *    - Form fields for Name, Email, and Message
 *    - Invisible "Honeypot" anti-spam trap (catches automated spam bots without
 *      frustrating humans with puzzle CAPTCHAs!)
 *    - Live submission states: disables the button while sending, and displays
 *      friendly confirmation or error feedback.
 */
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
  // Form input field state (name, email, message, and the secret honeypot 'website')
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' });
  // Form submission status: 'idle' | 'sending' | 'success' | 'error'
  const [formState, setFormState] = useState('idle');
  // Error message text if submission fails
  const [errorMessage, setErrorMessage] = useState('');

  // Configurable headings from Django CMS
  const indexLabel = sectionConfig?.index_label || "07 / CONTACT";
  const titleLine1 = sectionConfig?.title_line1 || "Have a role or";
  const titleLine2 = sectionConfig?.title_line2 || "project in mind";

  /**
   * Handles contact form submission when the user clicks "Send message".
   */
  async function handleSubmit(e) {
    e.preventDefault(); // Prevents the browser from reloading the page
    setFormState('sending');
    setErrorMessage('');

    try {
      // Send the inquiry to the Django backend
      await api.submitContact(form);
      // Show success message and clear the form fields
      setFormState('success');
      setForm({ name: '', email: '', message: '', website: '' });
    } catch (err) {
      // If an error occurred, extract any validation details sent by Django
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
        {/* Left Column: Direct email & Social profile links */}
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

        {/* Right Column: Contact Inquiry Form */}
        <form className="contact-form reveal" onSubmit={handleSubmit}>
          <div className="form-title">
            <span>LET'S START A CONVERSATION</span>
            <Send size={18} />
          </div>

          {/* 
            ANTI-SPAM HONEYPOT TRAP:
            This input is hidden from human visitors with display:none.
            Automated spam bots fill in every field they see. If this field contains
            any value when received by Django, the server knows it's a bot and drops it!
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

          {/* Email Field */}
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

          {/* Message Textarea */}
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

          {/* Submit Button */}
          <button
            className="button button-primary form-submit"
            type="submit"
            disabled={formState === 'sending'}
          >
            {formState === 'sending' ? 'Sending…' : 'Send message'}{' '}
            <ArrowRight size={16} />
          </button>

          {/* Confirmation Alert on Success */}
          {formState === 'success' && (
            <p className="form-feedback success">
              Message sent successfully! Thanks for reaching out.
            </p>
          )}

          {/* Error Notice on Failure */}
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


