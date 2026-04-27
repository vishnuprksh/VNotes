/**
 * agentRouter.js
 * Determines if an input should be handled by the command system or the AI agent.
 *
 * Rules:
 *  - Starts with '/' → COMMAND (handled by executeCommand switch)
 *  - Anything else    → AGENT  (natural language, routed to agentCore)
 */

export const ROUTE_COMMAND = 'command';
export const ROUTE_AGENT = 'agent';

/**
 * @param {string} input - Raw terminal input string
 * @returns {'command' | 'agent'}
 */
export function routeInput(input) {
  const trimmed = input.trim();
  if (!trimmed) return ROUTE_COMMAND; 
  // '/' prefix means AI Agent, otherwise Command
  return trimmed.startsWith('/') ? ROUTE_AGENT : ROUTE_COMMAND;
}
