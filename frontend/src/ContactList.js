import React, { useState, useEffect } from 'react';

function ContactList({ contacts, onEdit, onDelete, onSendEmail, selectedContacts, onContactSelect }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Automatic responsive view: Mobile = Table View, Desktop = Card View
  const shouldShowCards = !isMobile;

  if (contacts.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        color: '#666',
        fontSize: '1.1rem'
      }}>
        📱 No contacts found. Add your first contact above!
      </div>
    );
  }

  return (
    <div>
      {/* Card View */}
      {shouldShowCards ? (
        <div className="contact-card-grid">
          {contacts.map(contact => (
            <div className="contact-card" key={contact.contact_id}>
              <div className="contact-card-header">
                <input
                  type="checkbox"
                  checked={selectedContacts.includes(contact.contact_id)}
                  onChange={() => onContactSelect(contact.contact_id)}
                  style={{ marginRight: '8px' }}
                />
              </div>
              <div className="contact-card-main">
                <div className="contact-card-names">
                  <span className="contact-card-name">
                    {contact.first_name} {contact.last_name}
                  </span>
                </div>
                <div className="contact-card-info">
                  {contact.phone_number && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '1rem' }}>📞</span>
                      <a href={`tel:${contact.phone_number}`} style={{ color: '#1976d2', textDecoration: 'none' }}>
                        {contact.phone_number}
                      </a>
                    </div>
                  )}
                  {contact.email_address && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '1rem' }}>📧</span>
                      <a href={`mailto:${contact.email_address}`} style={{ color: '#1976d2', textDecoration: 'none' }}>
                        {contact.email_address}
                      </a>
                    </div>
                  )}
                  {contact.address && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '1rem' }}>📍</span>
                      <span style={{ color: '#666' }}>{contact.address}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="contact-card-actions">
                <button onClick={() => onEdit(contact)} style={{ background: '#4caf50' }}>
                  ✏️ Edit
                </button>
                <button 
                  onClick={() => onSendEmail(contact)} 
                  disabled={!contact.email_address}
                  style={{ background: contact.email_address ? '#2196f3' : '#ccc' }}
                >
                  📧 Email
                </button>
                <button onClick={() => onDelete(contact.contact_id)} style={{ background: '#f44336' }}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <table className="contact-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map(contact => (
              <tr key={contact.contact_id}>
                <td data-label="Select:">
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(contact.contact_id)}
                    onChange={() => onContactSelect(contact.contact_id)}
                  />
                </td>
                <td data-label="Name:">
                  {contact.first_name} {contact.last_name}
                </td>
                <td data-label="Phone:">
                  {contact.phone_number ? (
                    <a href={`tel:${contact.phone_number}`} style={{ color: '#1976d2' }}>
                      {contact.phone_number}
                    </a>
                  ) : '-'}
                </td>
                <td data-label="Email:">
                  {contact.email_address ? (
                    <a href={`mailto:${contact.email_address}`} style={{ color: '#1976d2' }}>
                      {contact.email_address}
                    </a>
                  ) : '-'}
                </td>
                <td data-label="Address:">
                  {contact.address || '-'}
                </td>
                <td data-label="Actions:">
                  <button onClick={() => onEdit(contact)} style={{ background: '#4caf50', marginRight: '4px' }}>
                    Edit
                  </button>
                  <button 
                    onClick={() => onSendEmail(contact)} 
                    disabled={!contact.email_address}
                    style={{ 
                      background: contact.email_address ? '#2196f3' : '#ccc', 
                      marginRight: '4px' 
                    }}
                  >
                    Email
                  </button>
                  <button onClick={() => onDelete(contact.contact_id)} style={{ background: '#f44336' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ContactList; 