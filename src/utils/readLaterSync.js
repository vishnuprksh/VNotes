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

  // Check if it's already grouped: [{ group, summaries: [...] }]
  if (data.length > 0 && data[0].summaries !== undefined) {
    return data.map(item => ({
      group: item.group || item.name || item.category || 'Uncategorized',
      summaries: Array.isArray(item.summaries) ? item.summaries : [],
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
  const url = `${API_BASE}?api_key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  const json = await response.json();
  const raw = json.data ?? json;
  const groups = normalizeData(Array.isArray(raw) ? raw : [raw]);

  const notes = [];
  groups.forEach(({ group, summaries }) => {
    const category = `Projects/${group}`;
    summaries.forEach(summary => {
      const title = summary.title || summary.name || 'Untitled';
      const rawContent = summary.content || summary.summary || summary.text || summary.body || '';
      const url = summary.url || summary.link || summary.source || '';

      let html = markdownToHtml(rawContent);
      // Prepend heading + source link if available
      const heading = `<h2>${title}</h2>`;
      const sourceLink = url ? `<p><a href="${url}" target="_blank" rel="noreferrer">${url}</a></p>` : '';
      html = heading + sourceLink + html;

      notes.push({
        id: `readlater-${summary.id || summary._id || Date.now() + Math.random()}`,
        title,
        category,
        tag: group,
        createdAt: summary.created_at || summary.createdAt || new Date().toISOString(),
        content: html,
        syncedFrom: 'readlater',
      });
    });
  });

  return notes;
}
