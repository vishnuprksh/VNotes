/**
 * openRouterClient.js
 * Thin streaming client for OpenRouter chat completions.
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'z-ai/glm-4.5-air:free';

/**
 * Stream a chat completion from OpenRouter.
 * @param {string} apiKey - OpenRouter API key
 * @param {string} model  - OpenRouter model identifier (e.g. 'openai/gpt-4o')
 * @param {Array} messages - [{ role: 'system'|'user'|'assistant', content: string }]
 * @param {Function} onToken - called with each text chunk as it streams
 * @param {Function} onDone - called when stream is complete
 * @param {Function} onError - called with error message string on failure
 */
export async function streamChat({ apiKey, model, messages, onToken, onDone, onError }) {
  if (!apiKey) {
    onError('No API key set. Go to Settings → API Keys to add your OpenRouter key.');
    return;
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://vnotes.app',
        'X-Title': 'VNotes Agent',
      },
      body: JSON.stringify({
        model: model || DEFAULT_MODEL,
        messages,
        stream: true,
        max_tokens: 512,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      onError(`OpenRouter error ${response.status}: ${err}`);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep incomplete line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) onToken(delta);
        } catch {
          // Ignore malformed SSE chunks
        }
      }
    }

    onDone();
  } catch (err) {
    onError(`Network error: ${err.message}`);
  }
}
