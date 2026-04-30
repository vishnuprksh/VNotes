import React, { useState, useEffect } from 'react';
import { useNotesContext } from '../context/NotesContext';
import { fetchReadLaterNotes } from '../utils/readLaterSync';

const MODELS = [
  { id: 'z-ai/glm-4.5-air:free', label: 'GLM 4.5 Air — Free (OpenRouter)' },
  { id: 'nvidia/nemotron-3-super-120b-a12b:free', label: 'Nemotron 3 Super 120B — Free (NVIDIA)' },
  { id: 'minimax/minimax-m2.5:free', label: 'MiniMax m2.5 — Free (MiniMax)' },
  { id: 'openai/gpt-oss-120b:free', label: 'GPT OSS 120B — Free (OpenAI)' },
  { id: 'liquid/lfm-2.5-1.2b-thinking:free', label: 'LFM 2.5 1.2B Thinking — Free (Liquid)' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', label: 'Llama 3.3 70B Instruct — Free (Meta)' },
  { id: 'baidu/qianfan-ocr-fast:free', label: 'Qianfan OCR Fast — Free (Baidu)' },
];

const Settings = ({ isOpen, onClose }) => {
  const { userSettings, updateSettings, syncReadLater, syncStatus, syncMessage, setSyncStatus } = useNotesContext();

  const [activeTab, setActiveTab] = useState('ai');
  // Local draft state — only commits on Save
  const [draft, setDraft] = useState(userSettings);
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // Sync draft when settings load from Firestore
  useEffect(() => {
    setDraft(userSettings);
  }, [userSettings]);

  const handleChange = (key, value) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateSettings(draft);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  const handleCancel = () => {
    setDraft(userSettings); // discard draft
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={handleCancel}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>

        {/* ── Sidebar nav ── */}
        <div className="settings-sidebar">
          <div className="settings-header">
            <h3>Settings</h3>
          </div>
          <div className="settings-nav">
            <button
              className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              <i className="fas fa-cog"></i> General
            </button>
            <button
              className={`settings-tab ${activeTab === 'ai' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai')}
            >
              <i className="fas fa-robot"></i> AI &amp; Models
            </button>
            <button
              className={`settings-tab ${activeTab === 'apikeys' ? 'active' : ''}`}
              onClick={() => setActiveTab('apikeys')}
            >
              <i className="fas fa-key"></i> API Keys
            </button>
            <button
              className={`settings-tab ${activeTab === 'appearance' ? 'active' : ''}`}
              onClick={() => setActiveTab('appearance')}
            >
              <i className="fas fa-paint-brush"></i> Appearance
            </button>
            <button
              className={`settings-tab ${activeTab === 'sync' ? 'active' : ''}`}
              onClick={() => { setActiveTab('sync'); setSyncStatus(null); }}
            >
              <i className="fas fa-sync-alt"></i> Sync
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="settings-content">
          <button className="settings-close" onClick={handleCancel}>
            <i className="fas fa-times"></i>
          </button>

          {/* General */}
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

          {/* AI & Models */}
          {activeTab === 'ai' && (
            <div className="settings-pane">
              <h2>AI &amp; Models</h2>
              <p className="settings-desc">Configure the agent's model and behavior.</p>

              <div className="settings-field">
                <label>Default Model</label>
                <select
                  value={draft.defaultModel}
                  onChange={e => handleChange('defaultModel', e.target.value)}
                  className="settings-input"
                >
                  {MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
                <span className="settings-hint">
                  All models are accessed via your OpenRouter key (API Keys tab).
                </span>
              </div>

              <div className="settings-field">
                <label>System Prompt</label>
                <textarea
                  value={draft.systemPrompt}
                  onChange={e => handleChange('systemPrompt', e.target.value)}
                  className="settings-input textarea"
                  rows="5"
                  placeholder="Instructions that guide the AI's persona and behavior…"
                />
                <span className="settings-hint">
                  The note context is always appended automatically — this prepends your persona.
                </span>
              </div>

              <div className="settings-field checkbox">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={draft.streamResponses}
                    onChange={e => handleChange('streamResponses', e.target.checked)}
                  />
                  <span>Stream Responses</span>
                </label>
                <span className="settings-hint">Show the AI response incrementally as it's generated.</span>
              </div>
            </div>
          )}

          {/* API Keys */}
          {activeTab === 'apikeys' && (
            <div className="settings-pane">
              <h2>API Keys</h2>
              <p className="settings-desc">
                Keys are stored in your Firebase account — synced across devices.
              </p>

              <div className="settings-field">
                <label>OpenRouter API Key</label>
                <div className="settings-input-row">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={draft.openRouterKey}
                    onChange={e => handleChange('openRouterKey', e.target.value)}
                    className="settings-input"
                    placeholder="sk-or-v1-…"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    className="settings-eye-btn"
                    onClick={() => setShowKey(v => !v)}
                    title={showKey ? 'Hide key' : 'Show key'}
                    type="button"
                  >
                    <i className={`fas ${showKey ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                <span className="settings-hint">
                  Get a free key at{' '}
                  <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer">
                    openrouter.ai/keys
                  </a>.
                  Required to use the AI terminal agent.
                </span>
              </div>

              {draft.openRouterKey && (
                <div className="settings-key-status">
                  <i className="fas fa-check-circle"></i>
                  Key configured — will be used for all AI queries.
                </div>
              )}
            </div>
          )}

          {/* Appearance */}
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

          {/* Sync */}
          {activeTab === 'sync' && (
            <div className="settings-pane">
              <h2>Read-Later Sync</h2>
              <p className="settings-desc">
                Import summaries from your read-later service. Each group becomes a subsection
                under <strong>Projects</strong>, and each summary becomes a note.
              </p>

              <div className="settings-field">
                <label>Read-Later API Key</label>
                <input
                  type="password"
                  value={draft.readLaterApiKey || ''}
                  onChange={e => handleChange('readLaterApiKey', e.target.value)}
                  className="settings-input"
                  placeholder="Paste your API key here…"
                  autoComplete="off"
                  spellCheck={false}
                />
                <span className="settings-hint">
                  Used to fetch summaries from your read-later service API.
                </span>
              </div>

              <div className="settings-field">
                <button
                  className="settings-btn primary"
                  disabled={syncStatus === 'syncing' || !draft.readLaterApiKey}
                  onClick={async () => {
                    // Save key first, then sync
                    updateSettings({ readLaterApiKey: draft.readLaterApiKey });
                    await syncReadLater(draft.readLaterApiKey);
                  }}
                >
                  {syncStatus === 'syncing'
                    ? <><i className="fas fa-spinner fa-spin"></i> Syncing…</>
                    : <><i className="fas fa-sync-alt"></i> Sync Now</>}
                </button>
              </div>

              {syncStatus === 'done' && (
                <div className="settings-key-status">
                  <i className="fas fa-check-circle"></i> {syncMessage}
                </div>
              )}
              {syncStatus === 'error' && (
                <div className="settings-key-status" style={{ color: 'var(--color-error, #e74c3c)' }}>
                  <i className="fas fa-exclamation-circle"></i> {syncMessage}
                </div>
              )}

              <p className="settings-hint" style={{ marginTop: '1rem' }}>
                Re-syncing replaces previously synced notes. Your manually created notes are never affected.
              </p>
            </div>
          )}

          <div className="settings-footer">
            <button className="settings-btn secondary" onClick={handleCancel}>Cancel</button>
            <button
              className={`settings-btn primary ${saved ? 'saved' : ''}`}
              onClick={handleSave}
            >
              {saved ? <><i className="fas fa-check"></i> Saved!</> : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
