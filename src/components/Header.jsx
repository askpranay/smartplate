import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Header = ({ onToggleFavorites, showFavorites }) => {
  const { user, signInWithGoogle, logOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="header">
      <div className="container header-content">
        <div className="logo">🍽️ SmartPlate</div>
        <nav>
          <ul className="nav-links" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Favorites Toggle Button */}
            <li style={{ listStyle: 'none' }}>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); onToggleFavorites(); }}
                style={{
                  color: '#ff6b6b',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  transition: 'background 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,107,107,0.1)'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                {showFavorites ? '🏠 Home' : '❤️ Favorites'}
              </a>
            </li>

            {/* Google Sign In Button - Show when NOT logged in */}
            {!user && (
              <li style={{ listStyle: 'none' }}>
                <button
                  onClick={signInWithGoogle}
                  style={{
                    background: '#fff',
                    color: '#333',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    marginLeft: '0.5rem'
                  }}
                >
                  <img 
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    style={{ width: 18 }} 
                    alt="G" 
                  />
                  Sign in
                </button>
              </li>
            )}

            {/* User Button & Dropdown - Show when logged in */}
            {user && (
              <li style={{ listStyle: 'none', position: 'relative' }}>
                {/* White rounded rectangle button instead of circular avatar */}
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    background: '#ffffff',
                    color: '#000000',
                    borderRadius: '12px',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    border: '2px solid #ff6b6b',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    marginLeft: '0.5rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }}
                >
                  {/* Small colored circle with initial */}
                  <span style={{
                    background: '#ff6b6b',
                    color: '#ffffff',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                  </span>
                  {/* User name in black text */}
                  <span style={{ color: '#000000' }}>
                    {user.displayName ? user.displayName.split(' ')[0] : 'User'}
                  </span>
                  {/* Dropdown arrow */}
                  <span style={{ 
                    color: '#666', 
                    fontSize: '0.7rem',
                    marginLeft: '2px'
                  }}>
                    ▼
                  </span>
                </button>
                
                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="user-dropdown-menu" style={{
                    position: 'absolute',
                    right: 0,
                    top: '45px',
                    background: '#ffffff',
                    borderRadius: '12px',
                    padding: '1rem',
                    minWidth: 220,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    border: '1px solid #e0e0e0'
                  }}>
                    <p style={{ 
                      color: '#000000',
                      fontSize: '0.95rem', 
                      fontWeight: 600,
                      margin: '0 0 0.25rem 0',
                      lineHeight: 1.4
                    }}>
                      {user.displayName}
                    </p>
                    <p style={{ 
                      color: '#666666',
                      fontSize: '0.8rem', 
                      margin: '0 0 0.75rem 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {user.email}
                    </p>
                    <hr style={{ 
                      borderColor: '#e0e0e0', 
                      margin: '0.75rem 0',
                      borderWidth: '1px 0 0 0',
                      borderStyle: 'solid'
                    }} />
                    <button
                      onClick={() => { logOut(); setDropdownOpen(false); }}
                      style={{
                        width: '100%',
                        textAlign: 'center',
                        background: '#ff6b6b',
                        border: 'none',
                        color: '#ffffff',
                        padding: '0.6rem',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        transition: 'background 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#ff5252'}
                      onMouseLeave={(e) => e.target.style.background = '#ff6b6b'}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;