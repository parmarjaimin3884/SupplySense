import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input/Input';
import { Button } from '../../components/ui/Button/Button';
import { Select } from '../../components/ui/Select/Select';

import { FiUser, FiSliders, FiShield, FiKey, FiGlobe, FiCheck } from 'react-icons/fi';

export const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('PROFILE');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [company, setCompany] = useState(user?.company || '');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Platform Preferences & Governance</h1>
          <p className="page-subtitle">User profile, enterprise organization settings & API authentication keys</p>
        </div>
      </div>

      {/* Settings Tab Layout */}
      <div className="settings-layout-grid">
        {/* Left Navigation */}
        <div className="card-panel settings-nav-card">
          <button className={`s-nav-btn ${activeTab === 'PROFILE' ? 'active' : ''}`} onClick={() => setActiveTab('PROFILE')}>
            <FiUser size={16} /> User Profile
          </button>
          <button className={`s-nav-btn ${activeTab === 'COMPANY' ? 'active' : ''}`} onClick={() => setActiveTab('COMPANY')}>
            <FiSliders size={16} /> Enterprise Config
          </button>
          <button className={`s-nav-btn ${activeTab === 'SECURITY' ? 'active' : ''}`} onClick={() => setActiveTab('SECURITY')}>
            <FiShield size={16} /> Security & SSO
          </button>
          <button className={`s-nav-btn ${activeTab === 'API' ? 'active' : ''}`} onClick={() => setActiveTab('API')}>
            <FiKey size={16} /> API Keys & Webhooks
          </button>
        </div>

        {/* Right Settings Form */}
        <div className="card-panel settings-form-card">
          {saved && (
            <div className="save-success-banner">
              <FiCheck size={16} /> Settings successfully updated and saved!
            </div>
          )}

          {activeTab === 'PROFILE' && (
            <form onSubmit={handleSave} className="settings-form">
              <h3>User Account Profile</h3>
              <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Corporate Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input label="Role / Title" value={user?.role} disabled />
              <Button type="submit" variant="primary">Save Changes</Button>
            </form>
          )}

          {activeTab === 'COMPANY' && (
            <form onSubmit={handleSave} className="settings-form">
              <h3>Enterprise Organization</h3>
              <Input label="Company Legal Entity" value={company} onChange={(e) => setCompany(e.target.value)} />
              <Select label="Primary Operating Region" value="North America" options={[{ value: 'NA', label: 'North America' }, { value: 'EU', label: 'Europe' }]} />
              <Button type="submit" variant="primary">Update Enterprise</Button>
            </form>
          )}

          {activeTab === 'SECURITY' && (
            <div className="settings-form">
              <h3>Security & Authentication</h3>
              <p>SSO Provider: <strong>Microsoft Entra ID (Active)</strong></p>

            </div>
          )}

          {activeTab === 'API' && (
            <div className="settings-form">
              <h3>API Keys & FastAPI Webhook Tokens</h3>
              <div className="api-key-box">
                <code>spy_live_9481a0518f837194c</code>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
