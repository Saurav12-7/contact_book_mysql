import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './App.css';
import SearchScreen from './SearchScreen';
import AddContact from './AddContact';
import MainContacts from './MainContacts';

// Configure axios base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
axios.defaults.baseURL = API_BASE_URL;
// import { io } from 'socket.io-client'; // Temporarily disabled

function App() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    email_address: '',
    address: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('last_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filters, setFilters] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    email_address: '',
    address: ''
  });
  const [auth, setAuth] = useState({ token: localStorage.getItem('token'), username: localStorage.getItem('username'), role: localStorage.getItem('role') });
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [authForm, setAuthForm] = useState({ username: '', password: '', gmail: '' });
  const [authError, setAuthError] = useState('');
  const observer = useRef();
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailContact, setEmailContact] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailResult, setEmailResult] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  // Screen navigation state
  const [currentScreen, setCurrentScreen] = useState('main'); // 'main', 'search', 'addContact'
  const [filteredContacts, setFilteredContacts] = useState([]);
  // Contact sharing state
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareRecipientEmail, setShareRecipientEmail] = useState('');
  const [shareSubject, setShareSubject] = useState('Shared Contacts');
  const [shareMessage, setShareMessage] = useState('');
  const [shareSending, setShareSending] = useState(false);
  const [shareResult, setShareResult] = useState(null);
  // Profile modal removed - centralized email service is used instead

  // Function to handle automatic logout
  const handleAutoLogout = () => {
    console.log('Token expired, automatically logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setAuth({ token: null, username: null, role: null });
    setContacts([]);
    setError('');
    setAuthError('Your session has expired. Please log in again.');
  };

  // Function to refresh token
  const refreshToken = async () => {
    try {
      const res = await axios.post('/api/refresh');
      const newToken = res.data.token;
      setAuth({ token: newToken, username: res.data.username, role: res.data.role });
      localStorage.setItem('token', newToken);
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('role', res.data.role);
      console.log('Token refreshed successfully');
      return true;
    } catch (error) {
      console.log('Token refresh failed, logging out...');
      handleAutoLogout();
      return false;
    }
  };

  // Check if token is expired on app load
  const checkTokenExpiration = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        const timeUntilExpiry = payload.exp - currentTime;
        
        if (timeUntilExpiry < 0) {
          console.log('Token expired on app load, logging out...');
          handleAutoLogout();
        } else if (timeUntilExpiry < 300) { // Less than 5 minutes
          console.log('Token expiring soon, attempting refresh...');
          refreshToken();
        }
      } catch (error) {
        console.log('Invalid token format, logging out...');
        handleAutoLogout();
      }
    }
  };

  // Axios interceptor to handle 401 responses (token expired)
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Token expired or invalid
          handleAutoLogout();
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Check token expiration on app load
  useEffect(() => {
    checkTokenExpiration();
  }, []);

  // Periodic token expiration check (every minute)
  useEffect(() => {
    if (auth.token) {
      const interval = setInterval(() => {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            const timeUntilExpiry = payload.exp - currentTime;
            
            if (timeUntilExpiry < 0) {
              console.log('Token expired, logging out...');
              handleAutoLogout();
            } else if (timeUntilExpiry < 300) { // Less than 5 minutes
              console.log('Token expiring soon, attempting refresh...');
              refreshToken();
            }
          } catch (error) {
            console.log('Invalid token, logging out...');
            handleAutoLogout();
          }
        }
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [auth.token]);

  // Attach JWT to all requests
  useEffect(() => {
    axios.defaults.headers.common['Authorization'] = auth.token ? `Bearer ${auth.token}` : '';
  }, [auth.token]);

  // Fetch contacts
  const fetchContacts = async (q = '', pageNum = 1, append = false, customFilters = filters, customSortBy = sortBy, customSortOrder = sortOrder) => {
    // Don't fetch if not authenticated
    if (!auth.token) return;
    
    setLoading(true);
    try {
      let url = `/api/contacts?page=${pageNum}&limit=${limit}`;
      if (q) url += `&q=${encodeURIComponent(q)}`;
      Object.entries(customFilters).forEach(([key, value]) => {
        if (value) url += `&${key}=${encodeURIComponent(value)}`;
      });
      url += `&sort_by=${customSortBy}&sort_order=${customSortOrder}`;
      const res = await axios.get(url);
      if (append) {
        setContacts(prev => [...prev, ...res.data.contacts]);
      } else {
        setContacts(res.data.contacts);
      }
      setTotal(res.data.total);
      setHasMore((pageNum * limit) < res.data.total);
      setError('');
    } catch (err) {
      setError('Failed to fetch contacts');
    }
    setLoading(false);
  };

  useEffect(() => {
    // Only fetch contacts if user is authenticated
    if (auth.token) {
      fetchContacts(search, 1, false);
      setPage(1);
    }
  }, [search, auth.token]);

  // Auto-refresh polling for real-time updates
  useEffect(() => {
    if (!auth.token || !autoRefreshEnabled) return;
    
    // Set up polling to refresh contacts every 5 seconds
    const pollInterval = setInterval(() => {
      // Only poll if user is not currently interacting with the app
      if (!loading && !editingId && !showEmailModal) {
        fetchContacts(search, 1, false);
        setPage(1);
        setLastRefresh(new Date());
      }
    }, 5000); // Poll every 5 seconds
    
    return () => {
      clearInterval(pollInterval);
    };
  }, [auth.token, autoRefreshEnabled, loading, editingId, showEmailModal, search]);
  
  // Manual refresh function
  const handleManualRefresh = () => {
    fetchContacts(search, 1, false);
    setPage(1);
    setLastRefresh(new Date());
  };

  // Infinite scroll observer
  const lastContactRef = useRef();
  useEffect(() => {
    // Only set up infinite scroll if user is authenticated
    if (!auth.token) return;
    if (loading) return;
    if (!hasMore) return;
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 200
      ) {
        if (!loading && hasMore) {
          fetchContacts(search, page + 1, true);
          setPage((prev) => prev + 1);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore, page, search, sortBy, sortOrder, filters, auth.token]);

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add a helper to extract error text from backend response
  function getErrorText(err, fallback) {
    if (err.response && err.response.data && err.response.data.error) {
      return err.response.data.error;
    }
    if (err.response && err.response.data && err.response.data.errors) {
      // For contact add errors (validation)
      return Object.values(err.response.data.errors).join(' | ');
    }
    return fallback;
  }

  // Add or update contact
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    try {
      if (editingId) {
        await axios.put(`/api/contacts/${editingId}`, form);
      } else {
        await axios.post('/api/contacts', form);
      }
      setForm({ first_name: '', last_name: '', phone_number: '', email_address: '', address: '' });
      setEditingId(null);
      fetchContacts(search, 1, false);
      setPage(1);
      setError('');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        setFieldErrors(err.response.data.errors);
        setError('');
      } else {
        setError(getErrorText(err, 'Failed to save contact'));
      }
    }
    setLoading(false);
  };

  // Edit contact
  const handleEdit = (contact) => {
    setForm({
      first_name: contact.first_name,
      last_name: contact.last_name,
      phone_number: contact.phone_number,
      email_address: contact.email_address,
      address: contact.address,
    });
    setEditingId(contact.contact_id);
  };

  // Delete contact
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`/api/contacts/${id}`);
      fetchContacts(search, 1, false);
      setPage(1);
      setError('');
    } catch (err) {
      setError('Failed to delete contact');
    }
    setLoading(false);
  };

  // Search contacts
  const handleSearch = (e) => {
    e.preventDefault();
    fetchContacts(search, 1, false);
    setPage(1);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
  };

  const handleClearSearch = () => {
    setSearch('');
    fetchContacts('', 1, false);
    setPage(1);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ first_name: '', last_name: '', phone_number: '', email_address: '', address: '' });
  };

  // Sorting and filtering handlers
  const handleSortByChange = (e) => {
    setSortBy(e.target.value);
    fetchContacts(search, 1, false, filters, e.target.value, sortOrder);
    setPage(1);
  };
  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
    fetchContacts(search, 1, false, filters, sortBy, e.target.value);
    setPage(1);
  };
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    fetchContacts(search, 1, false, newFilters, sortBy, sortOrder);
    setPage(1);
  };

  // Auth handlers
  const handleAuthInput = (e) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await axios.post('/api/login', authForm);
      setAuth({ token: res.data.token, username: res.data.username, role: res.data.role });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('role', res.data.role);
      // Clear any previous errors
      setError('');
    } catch (err) {
      setAuthError(getErrorText(err, 'Login failed'));
    }
  };
      const handleSignup = async (e) => {
        e.preventDefault();
        setAuthError('');
        try {
          await axios.post('/api/register', authForm);
          setAuthMode('login');
          setAuthForm({ username: '', password: '', gmail: '' });
          setAuthError('SUCCESS:Signup successful! Please log in.');
        } catch (err) {
          setAuthError(getErrorText(err, 'Signup failed'));
        }
      };
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setAuth({ token: null, username: null, role: null });
    // Clear contacts when logging out
    setContacts([]);
    setError('');
  };

  // Export contacts as CSV
  const handleExportCSV = async () => {
    try {
      const res = await axios.get('/api/contacts/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'contacts.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError('Failed to export contacts');
    }
  };

  // Handle file selection and import
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Automatically start import process
    setImporting(true);
    setImportResult(null);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await axios.post('/api/contacts/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImportResult(res.data);
      fetchContacts(search, 1, false);
      setPage(1);
    } catch (err) {
      setError('Failed to import contacts');
    }
    
    setImporting(false);
    // Reset file input so same file can be selected again
    e.target.value = '';
  };

  // Open file explorer when Import CSV button is clicked
  const handleImportCSV = () => {
    fileInputRef.current.click();
  };

  const handleSendEmail = (contact) => {
    setEmailContact(contact);
    setEmailSubject('');
    setEmailMessage('');
    setEmailResult(null);
    setShowEmailModal(true);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailSending(true);
    setEmailResult(null);
    try {
      const res = await axios.post(`/api/contacts/${emailContact.contact_id}/send_email`, {
        subject: emailSubject,
        message: emailMessage
      });
      setEmailResult({ success: true, message: res.data.message });
      setEmailSubject('');
      setEmailMessage('');
      setTimeout(() => setShowEmailModal(false), 2000);
    } catch (err) {
      setEmailResult({ success: false, message: getErrorText(err, 'Failed to send email') });
    }
    setEmailSending(false);
  };

  // Contact sharing handlers
  const handleContactSelect = (contactId) => {
    setSelectedContacts(prev => {
      if (prev.includes(contactId)) {
        return prev.filter(id => id !== contactId);
      } else {
        return [...prev, contactId];
      }
    });
  };

  const handleShareContacts = () => {
    if (selectedContacts.length === 0) {
      setError('Please select at least one contact to share');
      return;
    }
    setShowShareModal(true);
    setShareResult(null);
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    setShareSending(true);
    setShareResult(null);
    try {
      const res = await axios.post('/api/contacts/share', {
        contact_ids: selectedContacts,
        recipient_email: shareRecipientEmail,
        subject: shareSubject,
        message: shareMessage
      });
      setShareResult({ success: true, message: res.data.message });
      setSelectedContacts([]);
      setShareRecipientEmail('');
      setShareSubject('Shared Contacts');
      setShareMessage('');
      setTimeout(() => setShowShareModal(false), 2000);
    } catch (err) {
      setShareResult({ success: false, message: getErrorText(err, 'Failed to share contacts') });
    }
    setShareSending(false);
  };

  // Screen navigation handlers
  const handleSearchClick = () => {
    setCurrentScreen('search');
  };

  const handleAddContactClick = () => {
    setCurrentScreen('addContact');
    // Clear form when opening add contact
    setForm({ first_name: '', last_name: '', phone_number: '', email_address: '', address: '' });
    setEditingId(null);
    setFieldErrors({});
  };

  const handleBackToMain = () => {
    setCurrentScreen('main');
    setSearch('');
    setEditingId(null);
    setForm({ first_name: '', last_name: '', phone_number: '', email_address: '', address: '' });
    setFieldErrors({});
  };

  const handleSearchContactSelect = (contact) => {
    // When a contact is selected from search, you can either view details or edit
    setForm({
      first_name: contact.first_name,
      last_name: contact.last_name,
      phone_number: contact.phone_number,
      email_address: contact.email_address,
      address: contact.address,
    });
    setEditingId(contact.contact_id);
    setCurrentScreen('addContact');
  };

  const handleAddContactSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    try {
      if (editingId) {
        await axios.put(`/api/contacts/${editingId}`, form);
      } else {
        await axios.post('/api/contacts', form);
      }
      setForm({ first_name: '', last_name: '', phone_number: '', email_address: '', address: '' });
      setEditingId(null);
      setFieldErrors({});
      fetchContacts(search, 1, false);
      setPage(1);
      setError('');
      // Return to main screen after successful submit
      setCurrentScreen('main');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        setFieldErrors(err.response.data.errors);
        setError('');
      } else {
        setError(getErrorText(err, 'Failed to save contact'));
      }
    }
    setLoading(false);
  };

  // Update the existing handleEdit to navigate to add contact screen
  const handleEditFromList = (contact) => {
    setForm({
      first_name: contact.first_name,
      last_name: contact.last_name,
      phone_number: contact.phone_number,
      email_address: contact.email_address,
      address: contact.address,
    });
    setEditingId(contact.contact_id);
    setCurrentScreen('addContact');
  };

  // Profile functions removed - centralized email service is used instead

  if (!auth.token) {
    return (
      <div className="auth-page">
        <div className="auth-background">
          <div className="auth-container">
            <div className="auth-header">
              <div className="auth-icon">📇</div>
              <h1 className="auth-title">Contact Book</h1>
              <p className="auth-subtitle">Manage your contacts with ease</p>
            </div>
            
            <div className="auth-tabs">
              <button 
                className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => setAuthMode('login')}
              >
                <span className="auth-tab-icon">👤</span>
                Login
              </button>
              <button 
                className={`auth-tab ${authMode === 'signup' ? 'active' : ''}`}
                onClick={() => setAuthMode('signup')}
              >
                <span className="auth-tab-icon">✨</span>
                Sign Up
              </button>
            </div>

            <div className="auth-form-container">
              <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="auth-form">
                <div className="auth-input-group">
                  <div className="auth-input-icon">👤</div>
                  <input 
                    id="auth-username"
                    name="username" 
                    placeholder="Enter your username" 
                    value={authForm.username} 
                    onChange={handleAuthInput} 
                    required 
                    className="auth-input"
                    autoComplete="username"
                  />
                </div>
                
                <div className="auth-input-group">
                  <div className="auth-input-icon">🔒</div>
                  <input 
                    id="auth-password"
                    name="password" 
                    type="password" 
                    placeholder="Enter your password" 
                    value={authForm.password} 
                    onChange={handleAuthInput} 
                    required 
                    className="auth-input"
                    autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="auth-submit-btn"
                  disabled={!authForm.username || !authForm.password}
                >
                  <span className="auth-btn-icon">{authMode === 'login' ? '🚀' : '🌟'}</span>
                  {authMode === 'login' ? 'Login' : 'Create Account'}
                </button>
              </form>
              
              {authError && (
                <div className={`auth-error ${authError.startsWith('SUCCESS:') ? 'auth-success' : ''}`}>
                  <span className="auth-error-icon">
                    {authError.startsWith('SUCCESS:') ? '✅' : '⚠️'}
                  </span>
                  <span className="auth-error-text">
                    {authError.startsWith('SUCCESS:') ? authError.substring(8) : authError}
                  </span>
                  <button 
                    onClick={() => setAuthError('')} 
                    className="auth-error-close"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-book-container">
      <div className="contact-book-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Contact Book</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleLogout} style={{ padding: '8px 18px', fontWeight: 'bold', borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', fontSize: '1em', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>
      
      {/* Session Expiration Warning */}
      {auth.token && (() => {
        try {
          const payload = JSON.parse(atob(auth.token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          const timeUntilExpiry = payload.exp - currentTime;
          const minutesUntilExpiry = Math.floor(timeUntilExpiry / 60);
          
          if (minutesUntilExpiry <= 30 && minutesUntilExpiry > 0) {
            return (
              <div style={{
                background: minutesUntilExpiry <= 10 ? '#ff6b6b' : '#ffa726',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '6px',
                margin: '10px 0',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                ⚠️ Your session will expire in {minutesUntilExpiry} minute{minutesUntilExpiry !== 1 ? 's' : ''}. 
                {minutesUntilExpiry <= 10 && ' Please save your work and log in again.'}
              </div>
            );
          }
          return null;
        } catch (error) {
          return null;
        }
      })()}
      
      {/* Hidden file input for CSV import */}
      <input 
        type="file" 
        accept=".csv" 
        ref={fileInputRef} 
        onChange={handleFileSelect}
        style={{ display: 'none' }} 
      />
      
      {/* Import Result Modal */}
      {importResult && (
        <div className={`import-result ${importResult.imported > 0 ? 'success' : 'warning'}`}>
          <div className="import-result-icon">
            {importResult.imported > 0 ? '✅' : '⚠️'}
          </div>
          <div className="import-result-content">
            <div className="import-result-title">
              {importResult.imported > 0 
                ? 'Import Successful!' 
                : 'Import Complete'}
            </div>
            <div className="import-result-details">
              {importResult.imported > 0 
                ? `${importResult.imported} contacts imported${importResult.skipped > 0 ? `, ${importResult.skipped} skipped` : ''}`
                : `No new contacts imported${importResult.skipped > 0 ? ` (${importResult.skipped} duplicates found)` : ''}`
              }
            </div>
          </div>
          <button 
            onClick={() => setImportResult(null)} 
            className="import-result-close"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Conditional Screen Rendering */}
      {currentScreen === 'main' && (
        <MainContacts
          contacts={contacts}
          onEdit={handleEditFromList}
          onDelete={handleDelete}
          onSendEmail={handleSendEmail}
          onSearchClick={handleSearchClick}
          onAddContactClick={handleAddContactClick}
          loading={loading}
          lastRefresh={lastRefresh}
          autoRefreshEnabled={autoRefreshEnabled}
          onExportCSV={handleExportCSV}
          onImportCSV={handleImportCSV}
          importing={importing}
          selectedContacts={selectedContacts}
          onContactSelect={handleContactSelect}
          onShareContacts={handleShareContacts}
        />
      )}

      {currentScreen === 'search' && (
        <SearchScreen
          onBack={handleBackToMain}
          onContactSelect={handleSearchContactSelect} // <-- updated here
          contacts={contacts}
          loading={loading}
        />
      )}

      {currentScreen === 'addContact' && (
        <AddContact
          form={form}
          onBack={handleBackToMain}
          loading={loading}
          onChange={handleChange}
          onSubmit={handleAddContactSubmit}
          errors={fieldErrors}
          editingId={editingId}
        />
      )}

      {/* Error Display */}
      {error && (
        <div style={{ color: 'red', background: '#ffeaea', padding: 10, borderRadius: 6, margin: '10px 0', position: 'relative', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
          <span>{error}</span>
          <button onClick={() => setError('')} style={{ position: 'absolute', right: 8, top: 8, background: 'none', border: 'none', fontWeight: 'bold', color: '#d32f2f', cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>
      )}
      {/* Removed pagination controls */}
      {showEmailModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 320, maxWidth: 400 }}>
            <h3>Send Email to {emailContact?.first_name} {emailContact?.last_name}</h3>
            <form onSubmit={handleEmailSubmit}>
              <input
                type="text"
                placeholder="Subject"
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
                required
                style={{ width: '100%', marginBottom: 8, padding: 6 }}
              />
              <textarea
                placeholder="Message"
                value={emailMessage}
                onChange={e => setEmailMessage(e.target.value)}
                required
                rows={5}
                style={{ width: '100%', marginBottom: 8, padding: 6 }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" onClick={() => setShowEmailModal(false)} disabled={emailSending}>Cancel</button>
                <button type="submit" disabled={emailSending || !emailSubject || !emailMessage}>
                  {emailSending ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </form>
            {emailResult && (
              <div style={{ color: emailResult.success ? 'green' : 'red', marginTop: 8 }}>
                {emailResult.message}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Share Contacts Modal */}
      {showShareModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 320, maxWidth: 400 }}>
            <h3>Share {selectedContacts.length} Contact{selectedContacts.length !== 1 ? 's' : ''}</h3>
            <form onSubmit={handleShareSubmit}>
              <input
                type="email"
                placeholder="Recipient Email"
                value={shareRecipientEmail}
                onChange={e => setShareRecipientEmail(e.target.value)}
                required
                style={{ width: '100%', marginBottom: 8, padding: 6 }}
              />
              <input
                type="text"
                placeholder="Subject"
                value={shareSubject}
                onChange={e => setShareSubject(e.target.value)}
                required
                style={{ width: '100%', marginBottom: 8, padding: 6 }}
              />
              <textarea
                placeholder="Message (optional)"
                value={shareMessage}
                onChange={e => setShareMessage(e.target.value)}
                rows={4}
                style={{ width: '100%', marginBottom: 8, padding: 6 }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" onClick={() => setShowShareModal(false)} disabled={shareSending}>Cancel</button>
                <button type="submit" disabled={shareSending || !shareRecipientEmail || !shareSubject}>
                  {shareSending ? 'Sharing...' : 'Share Contacts'}
                </button>
              </div>
            </form>
            {shareResult && (
              <div style={{ color: shareResult.success ? 'green' : 'red', marginTop: 8 }}>
                {shareResult.message}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Profile Settings modal removed - centralized email service is used instead */}
    </div>
  );
}

export default App;
