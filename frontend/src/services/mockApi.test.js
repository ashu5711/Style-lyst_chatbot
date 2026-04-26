import { sendChatRequest } from './mockApi';
import { describe, it, expect } from 'vitest';

describe('Mock API Service', () => {
  it('returns a valid chat response after a simulated delay', async () => {
    const start = Date.now();
    const response = await sendChatRequest('Find me pants', null);
    const end = Date.now();

    // The delay should be at least 2500ms based on our mock implementation
    expect(end - start).toBeGreaterThanOrEqual(2400);

    // Validate the schema conforms to Part 5 Data Model
    expect(response).toBeDefined();
    expect(response.role).toBe('bot');
    expect(response.text).toBeDefined();
    expect(response.outfitRecommendation).toBeDefined();
    
    // Validate Complete the Look items
    const outfit = response.outfitRecommendation;
    expect(outfit.outfitId).toBe('outfit-001');
    expect(outfit.items.top).toBeDefined();
    expect(outfit.items.bottom).toBeDefined();
    expect(outfit.items.shoes).toBeDefined();
    expect(outfit.items.accessory).toBeDefined();
  });
});
