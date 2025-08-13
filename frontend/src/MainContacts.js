import React from 'react';
import ContactList from './ContactList';
import './MainContacts.css';

function MainContacts({ 
  contacts, 
  onEdit, 
  onDelete, 
  onSendEmail, 
  onSearchClick, 
  onAddContactClick,
  loading,
  lastRefresh,
  autoRefreshEnabled,
  onExportCSV,
  onImportCSV,
  importing,
  selectedContacts,
  onContactSelect,
  onShareContacts
}) {
  
  const getContactsCount = () => {
    return contacts.length;
  };

  return (
    <div className="main-contacts">
      {/* Header */}
      <div className="main-contacts-header">
        <h2 className="main-contacts-title">
          <span className="main-contacts-icon">📇</span>
          Contacts
          <span className="main-contacts-count">({getContactsCount()})</span>
        </h2>
        <div className="main-contacts-subtitle">
          Manage and organize your contacts
        </div>
      </div>

      {/* Search Bar */}
      <div className="main-search-container">
        <div className="main-search-bar" onClick={onSearchClick}>
          <div className="main-search-icon">🔍</div>
          <div className="main-search-placeholder">Search contacts</div>
          <div className="main-search-voice">🎤</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="main-contacts-actions">
        <button onClick={onAddContactClick} className="main-add-contact-btn">
          <span className="main-add-contact-icon">➕</span>
          <span className="main-add-contact-text">Add Contact</span>
        </button>
        
        <div className="main-contacts-menu">
          <button onClick={onExportCSV} className="main-menu-btn export-btn">
            <span className="main-menu-icon">📥</span>
            <span className="main-menu-text">Export</span>
          </button>
          
          <button 
            onClick={onImportCSV} 
            disabled={importing} 
            className={`main-menu-btn import-btn ${importing ? 'loading' : ''}`}
          >
            <span className="main-menu-icon">
              {importing ? '⏳' : '📤'}
            </span>
            <span className="main-menu-text">
              {importing ? 'Importing...' : 'Import'}
            </span>
          </button>

          <button 
            onClick={onShareContacts} 
            disabled={selectedContacts.length === 0}
            className={`main-menu-btn share-btn ${selectedContacts.length === 0 ? 'disabled' : ''}`}
          >
            <span className="main-menu-icon">📧</span>
            <span className="main-menu-text">
              Share ({selectedContacts.length})
            </span>
          </button>
        </div>
      </div>

      {/* Contacts List */}
      <div className="main-contacts-list">
        {loading && contacts.length === 0 ? (
          <div className="main-contacts-loading">
            <div className="main-contacts-spinner"></div>
            <div className="main-contacts-loading-text">Loading contacts...</div>
          </div>
        ) : contacts.length === 0 ? (
          <div className="main-contacts-empty">
            <div className="main-contacts-empty-icon">📱</div>
            <div className="main-contacts-empty-title">No contacts yet</div>
            <div className="main-contacts-empty-subtitle">
              Add your first contact to get started
            </div>
            <button onClick={onAddContactClick} className="main-contacts-empty-btn">
              <span className="main-contacts-empty-btn-icon">➕</span>
              Add Your First Contact
            </button>
          </div>
        ) : (
          <>
            <div className="main-contacts-list-header">
              <div className="main-contacts-list-info">
                <span className="main-contacts-list-count">
                  {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
                </span>
                {autoRefreshEnabled && (
                  <span className="main-contacts-list-refresh">
                    Last updated: {lastRefresh.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
            <ContactList
              contacts={contacts}
              onEdit={onEdit}
              onDelete={onDelete}
              onSendEmail={onSendEmail}
              selectedContacts={selectedContacts}
              onContactSelect={onContactSelect}
            />
          </>
        )}
      </div>

      {/* Loading indicator for refreshing */}
      {loading && contacts.length > 0 && (
        <div className="main-contacts-refreshing">
          <div className="main-contacts-refreshing-icon">🔄</div>
          <span>Refreshing...</span>
        </div>
      )}
    </div>
  );
}

export default MainContacts;
