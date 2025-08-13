import React from 'react';
import './AddContact.css';

function AddContact({ 
  form, 
  onBack, 
  loading, 
  onChange, 
  onSubmit, 
  errors = {},
  editingId = null 
}) {
  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className="add-contact-screen">
      {/* Header with back button */}
      <div className="add-contact-header">
        <button onClick={onBack} className="add-contact-back-btn">
          <span className="add-contact-back-icon">←</span>
        </button>
        <h2 className="add-contact-title">
          {editingId ? 'Edit Contact' : 'Add New Contact'}
        </h2>
        <div className="add-contact-header-spacer"></div>
      </div>

      {/* Contact Form */}
      <div className="add-contact-content">
        <div className="add-contact-avatar-section">
          <div className="add-contact-avatar-placeholder">
            <span className="add-contact-avatar-icon">👤</span>
          </div>
          <div className="add-contact-avatar-text">
            {editingId ? 'Edit Contact Info' : 'New Contact'}
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="add-contact-form">
          {/* First Name */}
          <div className="add-contact-field">
            <div className="add-contact-field-icon">👤</div>
            <div className="add-contact-field-content">
              <label htmlFor="add_first_name" className="add-contact-field-label">
                First Name
              </label>
              <input
                id="add_first_name"
                name="first_name"
                type="text"
                placeholder="Enter first name"
                value={form.first_name || ''}
                onChange={onChange}
                className={`add-contact-field-input ${errors.first_name ? 'error' : ''}`}
              />
              {errors.first_name && (
                <div className="add-contact-field-error">{errors.first_name}</div>
              )}
            </div>
          </div>

          {/* Last Name */}
          <div className="add-contact-field">
            <div className="add-contact-field-icon">👥</div>
            <div className="add-contact-field-content">
              <label htmlFor="add_last_name" className="add-contact-field-label">
                Last Name
              </label>
              <input
                id="add_last_name"
                name="last_name"
                type="text"
                placeholder="Enter last name"
                value={form.last_name || ''}
                onChange={onChange}
                className={`add-contact-field-input ${errors.last_name ? 'error' : ''}`}
              />
              {errors.last_name && (
                <div className="add-contact-field-error">{errors.last_name}</div>
              )}
            </div>
          </div>

          {/* Phone Number */}
          <div className="add-contact-field">
            <div className="add-contact-field-icon">📞</div>
            <div className="add-contact-field-content">
              <label htmlFor="add_phone_number" className="add-contact-field-label">
                Phone Number
              </label>
              <input
                id="add_phone_number"
                name="phone_number"
                type="tel"
                placeholder="Enter phone number"
                value={form.phone_number || ''}
                onChange={onChange}
                className={`add-contact-field-input ${errors.phone_number ? 'error' : ''}`}
              />
              {errors.phone_number && (
                <div className="add-contact-field-error">{errors.phone_number}</div>
              )}
            </div>
          </div>

          {/* Email Address */}
          <div className="add-contact-field">
            <div className="add-contact-field-icon">📧</div>
            <div className="add-contact-field-content">
              <label htmlFor="add_email_address" className="add-contact-field-label">
                Email Address
              </label>
              <input
                id="add_email_address"
                name="email_address"
                type="email"
                placeholder="Enter email address"
                value={form.email_address || ''}
                onChange={onChange}
                className={`add-contact-field-input ${errors.email_address ? 'error' : ''}`}
              />
              {errors.email_address && (
                <div className="add-contact-field-error">{errors.email_address}</div>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="add-contact-field">
            <div className="add-contact-field-icon">🏠</div>
            <div className="add-contact-field-content">
              <label htmlFor="add_address" className="add-contact-field-label">
                Address
              </label>
              <textarea
                id="add_address"
                name="address"
                placeholder="Enter address"
                value={form.address || ''}
                onChange={onChange}
                rows={3}
                className={`add-contact-field-textarea ${errors.address ? 'error' : ''}`}
              />
              {errors.address && (
                <div className="add-contact-field-error">{errors.address}</div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="add-contact-actions">
            <button
              type="button"
              onClick={onBack}
              className="add-contact-btn add-contact-btn-cancel"
              disabled={loading}
            >
              <span className="add-contact-btn-icon">✖️</span>
              Cancel
            </button>
            <button
              type="submit"
              className="add-contact-btn add-contact-btn-save"
              disabled={loading || (!form.first_name && !form.last_name && !form.phone_number)}
            >
              <span className="add-contact-btn-icon">
                {loading ? '⏳' : editingId ? '💾' : '➕'}
              </span>
              {loading 
                ? 'Saving...' 
                : editingId 
                  ? 'Update Contact' 
                  : 'Add Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddContact;
