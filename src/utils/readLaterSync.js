const API_BASE = 'https://exportnotes-bfqxs2tgzq-uc.a.run.app';

/**
 * Converts markdown text to basic HTML for the editor.
 */
function markdownToHtml(md) {
  if (!md) return '<p></p>';
  let html = md
    // headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // bold & italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // blockquote
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // unordered list items
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    // ordered list items
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // horizontal rule
    .replace(/^---+$/gm, '<hr>')
    // links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');

  // Wrap consecutive <li> with <ul>
  html = html.replace(/(<li>.*<\/li>\n?)+/g, match => `<ul>${match}</ul>`);

  // Wrap non-tagged lines in <p>
  html = html
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (/^<(h[1-6]|ul|ol|li|blockquote|pre|hr|p)/.test(trimmed)) return trimmed;
      return `<p>${trimmed}</p>`;
    })
    .filter(Boolean)
    .join('\n');

  return html || '<p></p>';
}

/**
 * Normalizes API response into { group, summaries[] } structure.
 * Handles both grouped and flat array formats.
 */
function normalizeData(data) {
  if (!Array.isArray(data)) return [];

  // Check if it's already grouped: [{ group, summaries: [...] }] or [{ name, sessions: [...] }]
  if (data.length > 0 && (data[0].summaries !== undefined || data[0].sessions !== undefined || data[0].notes !== undefined)) {
    return data.map(item => ({
      group: item.group || item.name || item.category || 'Uncategorized',
      summaries: Array.isArray(item.summaries) ? item.summaries : (Array.isArray(item.sessions) ? item.sessions : (Array.isArray(item.notes) ? item.notes : [])),
    }));
  }

  // Flat array: [{ id, title, group, content, ... }]
  const groups = {};
  data.forEach(item => {
    const group = item.group || item.category || item.folder || 'Uncategorized';
    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
  });

  return Object.entries(groups).map(([group, summaries]) => ({ group, summaries }));
}

/**
 * Fetches summaries from the read-later API and converts them to VNotes format.
 * Returns an array of note objects ready to be stored.
 */
export async function fetchReadLaterNotes(apiKey) {
  const trimmed = (apiKey || '').trim();
  if (!trimmed || trimmed.length > 128 || trimmed.includes(' ')) {
    throw new Error('Invalid API key format. Please enter the correct key from your read-later service.');
  }
  const url = `${API_BASE}?api_key=${encodeURIComponent(trimmed)}`;
  const response = await fetch(url);
  if (!response.ok) {
    let detail = '';
    try { detail = await response.text(); } catch (_) {}
    throw new Error(`API error ${response.status}: ${detail || response.statusText}`);
  }
  const json = await response.json();
  const raw = json.data ?? json;
  const groups = normalizeData(Array.isArray(raw) ? raw : [raw]);

  const notes = [];
  groups.forEach(({ group, summaries }) => {
    const category = `Projects/${group}`;
    summaries.forEach(summary => {
      const title = summary.title || summary.name || 'Untitled';
      const rawContent = summary.markdown || summary.content || summary.summary || summary.text || summary.body || '';
      const url = summary.url || summary.link || summary.source || '';

      let html = markdownToHtml(rawContent);
      // Prepend source link if available
      const sourceLink = url ? `<p><a href="${url}" target="_blank" rel="noreferrer">${url}</a></p>` : '';
      html = sourceLink + html;

      const dateVal = summary.created_at || summary.createdAt || summary.updatedAt;
      const createdAt = dateVal ? new Date(dateVal).toISOString() : new Date().toISOString();

      notes.push({
        id: `readlater-${summary.id || summary._id || Date.now() + Math.random()}`,
        title,
        category,
        tag: group,
        createdAt,
        content: html,
        syncedFrom: 'readlater',
      });
    });
  });

  return notes;
}
