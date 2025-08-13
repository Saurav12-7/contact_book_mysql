import React, { useState, useEffect } from 'react';
import './SearchScreen.css';

function SearchScreen({ onBack, onContactSelect, contacts = [], loading = false }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContacts, setFilteredContacts] = useState([]);

  // Filter contacts based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredContacts([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = contacts.filter(contact => {
      const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.toLowerCase();
      const phone = (contact.phone_number || '').toLowerCase();
      const email = (contact.email_address || '').toLowerCase();
      
      return fullName.includes(query) || 
             phone.includes(query) || 
             email.includes(query) ||
             (contact.first_name || '').toLowerCase().includes(query) ||
             (contact.last_name || '').toLowerCase().includes(query);
    });

    setFilteredContacts(filtered);
  }, [searchQuery, contacts]);

  const handleContactClick = (contact) => {
    if (onContactSelect) {
      onContactSelect(contact);
    }
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    // Simple phone formatting
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  const getContactInitials = (contact) => {
    const firstInitial = contact.first_name ? contact.first_name.charAt(0).toUpperCase() : '';
    const lastInitial = contact.last_name ? contact.last_name.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial || '?';
  };

  const getContactName = (contact) => {
    const firstName = contact.first_name || '';
    const lastName = contact.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown Contact';
  };

  return (
    <div className="search-screen">
      {/* Header with back button and search input */}
      <div className="search-screen-header">
        <button onClick={onBack} className="search-back-btn">
          <span className="search-back-icon">←</span>
        </button>
        <div className="search-screen-input-wrapper">
          <input
            type="text"
            placeholder="Search contacts"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-screen-input"
            autoFocus
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')} 
              className="search-clear-btn"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Search results */}
      <div className="search-screen-content">
        {loading && (
          <div className="search-loading">
            <div className="search-spinner"></div>
            <span>Searching...</span>
          </div>
        )}

        {!loading && searchQuery && filteredContacts.length === 0 && (
          <div className="search-no-results">
            <div className="search-no-results-icon">🔍</div>
            <div className="search-no-results-title">No contacts found</div>
            <div className="search-no-results-subtitle">
              Try searching with a different name or phone number
            </div>
          </div>
        )}

        {!loading && searchQuery && filteredContacts.length > 0 && (
          <div className="search-results">
            <div className="search-results-header">
              <span className="search-results-count">
                {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''} found
              </span>
            </div>
            <div className="search-results-list">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.contact_id}
                  className="search-result-item"
                  onClick={() => handleContactClick(contact)}
                >
                  <div className="search-result-avatar">
                    <span className="search-result-initials">
                      {getContactInitials(contact)}
                    </span>
                  </div>
                  <div className="search-result-info">
                    <div className="search-result-name">
                      {getContactName(contact)}
                    </div>
                    <div className="search-result-details">
                      {contact.phone_number && (
                        <span className="search-result-phone">
                          📞 {formatPhone(contact.phone_number)}
                        </span>
                      )}
                      {contact.email_address && (
                        <span className="search-result-email">
                          📧 {contact.email_address}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="search-result-actions">
                    <button className="search-result-call-btn">
                      ✏️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!searchQuery && (
          <div className="search-suggestions">
            <div className="search-suggestions-header">
              <span className="search-suggestions-title">Try searching for:</span>
            </div>
            <div className="search-suggestions-list">
              <div className="search-suggestion-item">
                <span className="search-suggestion-icon">👤</span>
                <span className="search-suggestion-text">Contact name</span>
              </div>
              <div className="search-suggestion-item">
                <span className="search-suggestion-icon">📞</span>
                <span className="search-suggestion-text">Phone number</span>
              </div>
              <div className="search-suggestion-item">
                <span className="search-suggestion-icon">📧</span>
                <span className="search-suggestion-text">Email address</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchScreen;
