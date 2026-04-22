/**
 * Subora Search Ranking System
 * Maps common search intents to relatable categories and tags.
 */

export const SEARCH_INTENT_MAP: Record<string, string[]> = {
  'memecoin': ['Crypto Alpha', 'Trading'],
  'shitcoin': ['Crypto Alpha'],
  'alpha': ['Crypto Alpha', 'Trading', 'Technical'],
  'signals': ['Trading', 'Crypto Alpha'],
  'gems': ['Crypto Alpha'],
  'moon': ['Crypto Alpha'],
  'trading': ['Trading', 'Technical'],
  'forex': ['Trading'],
  'stocks': ['Trading'],
  'coding': ['Technical', 'Education'],
  'development': ['Technical', 'Education'],
  'course': ['Education'],
  'learn': ['Education'],
  'fitness': ['Lifestyle'],
  'health': ['Lifestyle'],
  'luxury': ['Lifestyle'],
}

import { Space } from './supabase';

export type ScoredSpace = {
  space: Space;
  score: number;
}

export function rankSpaces(spaces: Space[], query: string, category: string): Space[] {
  const cleanQuery = query.trim().toLowerCase();
  
  if (!cleanQuery && category === 'All') return spaces;

  const scored: ScoredSpace[] = spaces.map(space => {
    let score = 0;
    const name = (space.name || '').toLowerCase();
    const desc = (space.description || '').toLowerCase();
    const cat = (space.category || '').toLowerCase();

    // 1. Exact Category Filter (Hard requirement if selected)
    if (category !== 'All' && space.category !== category) {
      return { space, score: -1 };
    }

    if (!cleanQuery) return { space, score: 1 };

    // 2. Exact matches (High weight)
    if (name.includes(cleanQuery)) score += 100;
    if (desc.includes(cleanQuery)) score += 50;
    if (cat.includes(cleanQuery)) score += 30;

    // 3. Word-by-word matches
    const words = cleanQuery.split(/\s+/);
    words.forEach(word => {
      if (word.length < 2) return;
      if (name.includes(word)) score += 20;
      if (desc.includes(word)) score += 10;
    });

    // 4. Intent Mapping (Relatability)
    for (const [intent, relatedCategories] of Object.entries(SEARCH_INTENT_MAP)) {
      if (cleanQuery.includes(intent)) {
        if (space.category && relatedCategories.includes(space.category)) {
          score += 40; // High boost for relatable category
        }
      }
    }

    return { space, score };
  });

  return scored
    .filter(s => s.score >= 0)
    .sort((a, b) => b.score - a.score)
    .map(s => s.space);
}
