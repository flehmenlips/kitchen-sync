import request from 'supertest';
import app from '../src/server'; // Adjust if your Express app export is elsewhere

// Example test slug and page
const TEST_SLUG = 'samson-bistro';
const TEST_PAGE = 'home';

describe('Unified Content API', () => {
  it('should return hero content including the content field', async () => {
    const res = await request(app)
      .get(`/api/restaurant/public/slug/${TEST_SLUG}/unified-content?page=${TEST_PAGE}`)
      .expect(200);
    expect(res.body.hero).toBeDefined();
    expect(res.body.hero.content).toBeDefined();
    // Optionally check for a known value
    // expect(res.body.hero.content).toContain('test');
  });
}); 