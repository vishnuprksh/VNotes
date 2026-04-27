import React, { useState, useEffect } from 'react';

const Settings = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('ai');
  const [config, setConfig] = useState({
    openRouterKey: '',
    openAIKey: '',
    defaultModel: 'z-ai/glm-4.5-air:free',
    systemPrompt: 'You are a helpful assistant integrated into a terminal of a note-taking app.',
    streamResponses: true,
  });

  useEffect(() => {
    const savedConfig = localStorage.getItem('vnotes-ai-config');
    if (savedConfig) {
      try {
        setConfig(prev => ({ ...prev, ...JSON.parse(savedConfig) }));
      } catch (e) {
        console.error("Failed to parse config", e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('vnotes-ai-config', JSON.stringify(config));
    onClose();
  };

  const handleChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>
        <div className="settings-sidebar">
          <div className="settings-header">
            <h3>Settings</h3>
          </div>
          <div className="settings-nav">
            <button className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
              <i className="fas fa-cog"></i> General
            </button>
            <button className={`settings-tab ${activeTab === 'ai' ? 'active' : ''}`} onClick={() => setActiveTab('ai')}>
              <i className="fas fa-robot"></i> AI & Models
            </button>
            <button className={`settings-tab ${activeTab === 'apikeys' ? 'active' : ''}`} onClick={() => setActiveTab('apikeys')}>
              <i className="fas fa-key"></i> API Keys
            </button>
            <button className={`settings-tab ${activeTab === 'appearance' ? 'active' : ''}`} onClick={() => setActiveTab('appearance')}>
              <i className="fas fa-paint-brush"></i> Appearance
            </button>
          </div>
        </div>
        
        <div className="settings-content">
          <button className="settings-close" onClick={onClose}><i className="fas fa-times"></i></button>
          
          {activeTab === 'general' && (
            <div className="settings-pane">
              <h2>General Settings</h2>
              <p className="settings-desc">Configure basic application behavior.</p>
              <div className="settings-empty">
                <i className="fas fa-tools"></i>
                <span>General settings coming soon.</span>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="settings-pane">
              <h2>AI & Models</h2>
              <p className="settings-desc">Configure agent behavior and default models.</p>
              
              <div className="settings-field">
                <label>Default Model</label>
                <select 
                  value={config.defaultModel} 
                  onChange={(e) => handleChange('defaultModel', e.target.value)}
                  className="settings-input"
                >
                  <option value="openai/gpt-4o">GPT-4o (OpenAI)</option>
                  <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (Anthropic)</option>
                  <option value="google/gemini-pro-1.5">Gemini 1.5 Pro (Google)</option>
                  <option value="z-ai/glm-4.5-air:free">GLM 4.5 Air (OpenRouter Free)</option>
                </select>
              </div>

              <div className="settings-field">
                <label>System Prompt</label>
                <textarea 
                  value={config.systemPrompt} 
                  onChange={(e) => handleChange('systemPrompt', e.target.value)}
                  className="settings-input textarea"
                  rows="4"
                />
                <span className="settings-hint">Instructions that guide the AI's behavior and persona.</span>
              </div>

              <div className="settings-field checkbox">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={config.streamResponses} 
                    onChange={(e) => handleChange('streamResponses', e.target.checked)}
                  />
                  <span>Stream Responses</span>
                </label>
                <span className="settings-hint">Show AI response incrementally as it's generated.</span>
              </div>
            </div>
          )}

          {activeTab === 'apikeys' && (
            <div className="settings-pane">
              <h2>API Keys</h2>
              <p className="settings-desc">Your keys are stored locally in your browser and never sent to our servers.</p>
              
              <div className="settings-field">
                <label>OpenRouter API Key</label>
                <input 
                  type="password" 
                  value={config.openRouterKey} 
                  onChange={(e) => handleChange('openRouterKey', e.target.value)}
                  className="settings-input"
                  placeholder="sk-or-v1-..."
                />
              </div>

              <div className="settings-field">
                <label>OpenAI API Key</label>
                <input 
                  type="password" 
                  value={config.openAIKey} 
                  onChange={(e) => handleChange('openAIKey', e.target.value)}
                  className="settings-input"
                  placeholder="sk-..."
                />
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="settings-pane">
              <h2>Appearance</h2>
              <p className="settings-desc">Customize the look and feel of VNotes.</p>
              <div className="settings-empty">
                <i className="fas fa-palette"></i>
                <span>Appearance settings coming soon.</span>
              </div>
            </div>
          )}

          <div className="settings-footer">
            <button className="settings-btn secondary" onClick={onClose}>Cancel</button>
            <button className="settings-btn primary" onClick={handleSave}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
