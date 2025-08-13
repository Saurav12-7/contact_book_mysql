import React, { useState } from 'react';

function validate(form) {
  const errors = {};
  if (!form.first_name.trim()) errors.first_name = 'First name is required';
  if (!form.last_name.trim()) errors.last_name = 'Last name is required';
  if (!form.phone_number.trim()) {
    errors.phone_number = 'Phone number is required';
  } else if (!/^[0-9\-\s]{7,15}$/.test(form.phone_number)) {
    errors.phone_number = 'Phone number must be 7-15 digits';
  }
  if (form.email_address && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email_address)) {
    errors.email_address = 'Invalid email address';
  }
  return errors;
}

function ContactForm({ form, editingId, loading, onChange, onSubmit, onCancel, errors = {} }) {
  const [localErrors, setLocalErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    setLocalErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="contact-form printable-contact-form enhanced-contact-form-bg">
      <div className="printable-form-title">Contact list</div>
      <div className="printable-form-field">
        <label htmlFor="first_name">Name:</label>
        <input 
          id="first_name"
          name="first_name" 
          placeholder="First Name" 
          value={form.first_name} 
          onChange={onChange} 
          required 
          className="printable-input" 
          type="text"
          autocomplete="given-name"
          aria-describedby={localErrors.first_name || errors.first_name ? "first_name_error" : undefined}
        />
        <input 
          id="last_name"
          name="last_name" 
          placeholder="Last Name" 
          value={form.last_name} 
          onChange={onChange} 
          required 
          className="printable-input" 
          type="text" 
          style={{ marginTop: 4 }}
          autocomplete="family-name"
          aria-describedby={localErrors.last_name || errors.last_name ? "last_name_error" : undefined}
        />
        {(localErrors.first_name || errors.first_name) && <span id="first_name_error" className="printable-error">{localErrors.first_name || errors.first_name}</span>}
        {(localErrors.last_name || errors.last_name) && <span id="last_name_error" className="printable-error">{localErrors.last_name || errors.last_name}</span>}
      </div>
      <div className="printable-form-field">
        <label htmlFor="address">Address:</label>
        <input 
          id="address"
          name="address" 
          placeholder="Address" 
          value={form.address} 
          onChange={onChange} 
          className="printable-input" 
          type="text"
          autocomplete="street-address"
        />
      </div>
      <div className="printable-form-field">
        <label htmlFor="phone_number">Phone:</label>
        <input 
          id="phone_number"
          name="phone_number" 
          placeholder="Phone Number" 
          value={form.phone_number} 
          onChange={onChange} 
          required 
          className="printable-input" 
          type="tel"
          autocomplete="tel"
          aria-describedby={localErrors.phone_number || errors.phone_number ? "phone_error" : undefined}
        />
        {(localErrors.phone_number || errors.phone_number) && <span id="phone_error" className="printable-error">{localErrors.phone_number || errors.phone_number}</span>}
      </div>
      <div className="printable-form-field">
        <label htmlFor="email_address">Email:</label>
        <input 
          id="email_address"
          name="email_address" 
          placeholder="Email" 
          value={form.email_address} 
          onChange={onChange} 
          className="printable-input" 
          type="email"
          autocomplete="email"
          aria-describedby={localErrors.email_address ? "email_error" : undefined}
        />
        {localErrors.email_address && <span id="email_error" className="printable-error">{localErrors.email_address}</span>}
      </div>
      <div className="printable-form-actions enhanced-form-actions">
        <button type="submit" disabled={loading} className="enhanced-btn">{editingId ? 'Update' : 'Add'} Contact</button>
        {editingId && <button type="button" onClick={onCancel} className="enhanced-btn cancel-btn">Cancel</button>}
      </div>
    </form>
  );
}

export default ContactForm; 