import fetch from 'node-fetch'; // Using node-fetch for CJS compatibility if needed, or ensure your tsconfig allows ES module imports for fetch

async function globalSetup() {
  console.log('Global setup: Preparing test database...');

  const baseUrl = process.env.BASE_URL || 'http://localhost:3001'; // From .env.test
  const prepareDbUrl = `${baseUrl}/api/test/prepare-database`;

  try {
    const response = await fetch(prepareDbUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to prepare test database. Status: ${response.status}. Body: ${errorBody}`);
    }

    const result = await response.json();
    console.log('Global setup: Test database prepared successfully.', result);

  } catch (error) {
    console.error('Global setup: Error preparing test database:', error);
    throw error; // Re-throw to stop the test run
  }
}

export default globalSetup;
