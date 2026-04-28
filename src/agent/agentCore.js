/**
 * agentCore.js
 * Orchestrates: vectorSearch → system prompt → OpenRouter streaming
 * Agent can READ notes and MODIFY the active note via a structured response block.
 */

import { vectorSearch } from './vectorSearch.js';
import { streamChat } from './openRouterClient.js';

// Strip HTML for clean context
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// Detect if query is about modifying/editing the active note
const MODIFICATION_KEYWORDS = /\b(proofread|proof read|edit|rewrite|fix|improve|correct|grammar|spelling|rephrase|summarize|shorten|expand|clean up|format|revise|polish|enhance|update|modify|change|refactor)\b/i;

function isNoteModificationRequest(query) {
  return MODIFICATION_KEYWORDS.test(query);
}

function buildSystemPrompt(relevantNotes, activeNote) {
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

  let activeNoteSection = '';
  if (activeNote) {
    activeNoteSection = `

ACTIVE NOTE (currently open — you CAN modify this):
Title: "${activeNote.title}"
---
${stripHtml(activeNote.content)}
---

If the user asks you to edit, proofread, improve, or modify their note, you MUST:
1. Make the requested changes to the active note content.
2. Return the COMPLETE modified note as valid HTML at the end of your response, wrapped exactly like this:
<MODIFIED_NOTE>
<h2>Title Here</h2><p>Your modified content here...</p>
</MODIFIED_NOTE>
3. Only include HTML tags that Tiptap supports: h1, h2, h3, p, ul, ol, li, strong, em, code, blockquote, hr, br.
4. Preserve the overall structure unless asked to change it.
5. After the block, briefly explain what you changed.`;
  }

  return `You are VNotes AI, an intelligent assistant for a personal note-taking app.
Today is ${today}.${activeNoteSection}

RELEVANT NOTES FROM THE USER'S VAULT:
---
${context}
---

Instructions:
- Answer based on the note content provided.
- If notes don't contain the answer, say so honestly and briefly.
- Be concise, warm, and insightful — like a smart personal assistant.
- When appropriate, end with a single natural follow-up question.
- Never fabricate information not in the notes.`;
}

/**
 * Parse the <MODIFIED_NOTE> block from agent response.
 * Returns the HTML string or null if not found.
 */
export function parseNoteModification(text) {
  const match = text.match(/<MODIFIED_NOTE>\s*([\s\S]*?)\s*<\/MODIFIED_NOTE>/);
  return match ? match[1].trim() : null;
}

/**
 * Run the agentic pipeline for a natural language query.
 * @param {Object} opts
 * @param {string} opts.query - The user's natural language input
 * @param {Object} opts.notes - Frozen read-only notes snapshot
 * @param {Object} [opts.activeNote] - The currently open note (can be modified)
 * @param {string} opts.apiKey - OpenRouter API key
 * @param {string} [opts.model] - OpenRouter model identifier
 * @param {string} [opts.systemPromptOverride] - Custom system prompt from settings
 * @param {Function} opts.onToken - callback(tokenString) for streaming tokens
 * @param {Function} opts.onDone - callback(fullText) when stream finishes
 * @param {Function} opts.onError - callback(errorMessage) on failure
 * @param {Function} opts.onSearchResults - callback(results) to show which notes were used
 * @param {Function} [opts.onNoteModification] - callback(htmlContent) when agent modifies note
 */
export async function runAgent({ query, notes, activeNote, apiKey, model, systemPromptOverride, onToken, onDone, onError, onSearchResults, onNoteModification }) {
  // 1. Semantic search: find most relevant notes (read-only)
  const frozenNotes = Object.freeze({ ...notes });
  const relevantNotes = vectorSearch(query, frozenNotes, 4);

  // Notify caller which notes were used (for UX transparency)
  if (onSearchResults) {
    onSearchResults(relevantNotes);
  }

  // 2. Determine if this is a modification request — include active note in prompt
  const wantsModification = activeNote && isNoteModificationRequest(query);
  const noteForPrompt = wantsModification ? activeNote : null;

  // 3. Build messages
  const systemPrompt = buildSystemPrompt(relevantNotes, noteForPrompt);
  const messages = [
    { role: 'system', content: systemPromptOverride
        ? `${systemPromptOverride}\n\n${systemPrompt}`
        : systemPrompt
    },
    { role: 'user', content: query },
  ];

  // 4. Stream response and accumulate for modification parsing
  let fullText = '';

  await streamChat({
    apiKey,
    model,
    messages,
    maxTokens: wantsModification ? 2048 : 512,
    onToken: (token) => {
      fullText += token;
      onToken(token);
    },
    onDone: () => {
      // Check for note modification block
      if (onNoteModification) {
        const modified = parseNoteModification(fullText);
        if (modified) {
          onNoteModification(modified);
        }
      }
      onDone(fullText);
    },
    onError,
  });
}
