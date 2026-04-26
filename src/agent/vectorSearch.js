/**
 * vectorSearch.js
 * Client-side TF-IDF cosine similarity search over notes.
 * READ-ONLY: receives a frozen notes snapshot, never modifies it.
 */

// Strip HTML tags from note content for clean text
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// Tokenize text into lowercase words (remove punctuation)
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

// Build a term-frequency map from tokens
function termFrequency(tokens) {
  const tf = {};
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }
  const total = tokens.length || 1;
  Object.keys(tf).forEach(k => (tf[k] /= total));
  return tf;
}

// Compute IDF across all documents
function inverseDocumentFrequency(docsTokens) {
  const docCount = docsTokens.length;
  const idf = {};
  const allTerms = new Set(docsTokens.flat());
  for (const term of allTerms) {
    const docsWithTerm = docsTokens.filter(doc => doc.includes(term)).length;
    idf[term] = Math.log((docCount + 1) / (docsWithTerm + 1)) + 1;
  }
  return idf;
}

// Compute TF-IDF vector for a document
function tfidfVector(tf, idf) {
  const vec = {};
  for (const term of Object.keys(tf)) {
    vec[term] = tf[term] * (idf[term] || 1);
  }
  return vec;
}

// Cosine similarity between two TF-IDF vectors
function cosineSimilarity(vecA, vecB) {
  const allTerms = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dot = 0, normA = 0, normB = 0;
  for (const term of allTerms) {
    const a = vecA[term] || 0;
    const b = vecB[term] || 0;
    dot += a * b;
    normA += a * a;
    normB += b * b;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Search notes by semantic similarity to a query.
 * @param {string} query - Natural language query
 * @param {Object} notes - Frozen notes snapshot { [id]: { title, content, category, ... } }
 * @param {number} topN - Max results to return (default 4)
 * @returns {Array} Ranked array of { note, score, excerpt }
 */
export function vectorSearch(query, notes, topN = 4) {
  const noteList = Object.values(notes);
  if (!noteList.length) return [];

  // Build corpus: each note = title + content
  const noteTexts = noteList.map(note => {
    const raw = `${note.title} ${note.category} ${stripHtml(note.content)}`;
    return raw;
  });

  const noteTokensList = noteTexts.map(tokenize);
  const queryTokens = tokenize(query);

  // Add query as a document for IDF calculation
  const allDocsTokens = [...noteTokensList, queryTokens];
  const idf = inverseDocumentFrequency(allDocsTokens);

  // Compute query TF-IDF
  const queryTF = termFrequency(queryTokens);
  const queryVec = tfidfVector(queryTF, idf);

  // Compute similarity for each note
  const results = noteList.map((note, i) => {
    const noteTF = termFrequency(noteTokensList[i]);
    const noteVec = tfidfVector(noteTF, idf);
    const score = cosineSimilarity(queryVec, noteVec);

    // Build a short excerpt (first 200 chars of clean text)
    const cleanText = stripHtml(note.content);
    const excerpt = cleanText.slice(0, 200) + (cleanText.length > 200 ? '...' : '');

    return { note, score, excerpt };
  });

  // Sort by score descending, return top N
  return results
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}
