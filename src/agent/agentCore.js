/**
 * agentCore.js
 * Orchestrates: vectorSearch → system prompt → OpenRouter streaming
 * Agent has READ-ONLY access to notes (frozen snapshot passed in).
 */

import { vectorSearch } from './vectorSearch.js';
import { streamChat } from './openRouterClient.js';

// Strip HTML for clean context
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildSystemPrompt(relevantNotes) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let context = '';
  if (relevantNotes.length > 0) {
    context = relevantNotes
      .map(({ note, excerpt }, i) => {
        const createdAt = note.createdAt
          ? `Created: ${new Date(note.createdAt).toLocaleDateString()}`
          : '';
        return `[Note ${i + 1}] "${note.title}" (${note.category})${createdAt ? ' | ' + createdAt : ''}
${stripHtml(note.content).slice(0, 400)}`;
      })
      .join('\n\n');
  } else {
    context = 'No relevant notes found.';
  }

  return `You are VNotes AI, an intelligent assistant with read-only access to the user's personal notes.
Today is ${today}.

RELEVANT NOTES FROM THE USER'S VAULT:
---
${context}
---

Instructions:
- Answer based ONLY on the note content provided above.
- If notes don't contain the answer, say so honestly and briefly.
- Be concise, warm, and insightful — like a smart personal assistant.
- When appropriate, end with a single natural follow-up question to help the user explore deeper.
- Never fabricate information not in the notes.`;
}

/**
 * Run the agentic pipeline for a natural language query.
 * @param {Object} opts
 * @param {string} opts.query - The user's natural language input
 * @param {Object} opts.notes - Frozen read-only notes snapshot
 * @param {string} opts.apiKey - OpenRouter API key
 * @param {string} [opts.model] - OpenRouter model identifier
 * @param {string} [opts.systemPromptOverride] - Custom system prompt from settings
 * @param {Function} opts.onToken - callback(tokenString) for streaming tokens
 * @param {Function} opts.onDone - callback() when stream finishes
 * @param {Function} opts.onError - callback(errorMessage) on failure
 * @param {Function} opts.onSearchResults - callback(results) to show which notes were used
 */
export async function runAgent({ query, notes, apiKey, model, systemPromptOverride, onToken, onDone, onError, onSearchResults }) {
  // 1. Semantic search: find most relevant notes (read-only)
  const frozenNotes = Object.freeze({ ...notes });
  const relevantNotes = vectorSearch(query, frozenNotes, 4);

  // Notify caller which notes were used (for UX transparency)
  if (onSearchResults) {
    onSearchResults(relevantNotes);
  }

  // 2. Build messages
  const systemPrompt = systemPromptOverride || buildSystemPrompt(relevantNotes);
  const messages = [
    { role: 'system', content: systemPromptOverride
        ? `${systemPromptOverride}\n\n${buildSystemPrompt(relevantNotes).split('---')[1] || ''}`
        : buildSystemPrompt(relevantNotes)
    },
    { role: 'user', content: query },
  ];

  // 3. Stream response from OpenRouter
  await streamChat({
    apiKey,
    model,
    messages,
    onToken,
    onDone,
    onError,
  });
}
