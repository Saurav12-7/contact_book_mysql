import React from 'react';

function ContactSearch({ search, onChange, onSearch, onClear }) {
  return (
    <div className="search-section">
      <div className="search-header">
        <h3 className="search-title">
          <span className="search-icon">🔍</span>
          Search Contacts
        </h3>
        <p className="search-subtitle">Find contacts by name or phone number</p>
      </div>
      
      <form onSubmit={onSearch} className="search-form">
        <label htmlFor="contact_search" className="visually-hidden">Search contacts</label>
        <div className="search-input-container">
          <div className="search-input-wrapper">
            <span className="search-input-icon">🔎</span>
            <input
              id="contact_search"
              name="search"
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={e => onChange(e.target.value)}
              autoComplete="off"
              aria-label="Search contacts by name or phone number"
              className="search-input"
            />
          </div>
          <div className="search-buttons">
            <button type="submit" className="search-btn search-btn-primary">
              <span className="search-btn-icon">🔍</span>
              Search
            </button>
            <button type="button" onClick={onClear} className="search-btn search-btn-secondary">
              <span className="search-btn-icon">✖️</span>
              Clear
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ContactSearch;
