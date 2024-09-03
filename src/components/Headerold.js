import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', justifyContent: 'space-around' }}>
          <li><Link to="/">Dashboard</Link></li>
          <li><Link to="/profile">Profile</Link></li>
          <li><Link to="/risk-assessment">Risk Assessment</Link></li>
          <li><Link to="/document-generation">Document Generation</Link></li>
          <li><Link to="/compliance">Compliance</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
