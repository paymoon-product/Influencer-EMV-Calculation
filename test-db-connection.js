#!/usr/bin/env node

// Simple script to test DATABASE_URL format and connection
const connectPgSimple = require('connect-pg-simple');
const session = require('express-session');

console.log('Testing DATABASE_URL connection...');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

console.log('✅ DATABASE_URL is set');
console.log('📏 Length:', process.env.DATABASE_URL.length);
console.log(
  '🔗 Starts with:',
  process.env.DATABASE_URL.substring(0, 30) + '...'
);

// Test URL parsing
try {
  const url = new URL(process.env.DATABASE_URL);
  console.log('✅ URL format is valid');
  console.log('🏠 Host:', url.hostname);
  console.log('🚪 Port:', url.port || 'default');
  console.log('🗄️ Database:', url.pathname.substring(1));
  console.log('👤 Username:', url.username);
  console.log('🔐 Password:', url.password ? '***' : 'none');
} catch (error) {
  console.error('❌ Invalid URL format:', error.message);
  process.exit(1);
}

// Test connect-pg-simple
try {
  const PGStore = connectPgSimple(session);

  let connectionString = process.env.DATABASE_URL;

  // Add SSL for Neon if needed
  if (
    connectionString.includes('neon.tech') ||
    connectionString.includes('neon.database')
  ) {
    const url = new URL(connectionString);
    if (!url.searchParams.has('sslmode')) {
      url.searchParams.set('sslmode', 'require');
      connectionString = url.toString();
      console.log('🔒 Added SSL mode for Neon database');
    }
  }

  const store = new PGStore({
    conString: connectionString,
    tableName: 'test_sessions',
    createTableIfMissing: true,
  });

  console.log('✅ PGStore created successfully');

  // Test a simple operation
  store.get('test-id', (err, session) => {
    if (
      err &&
      err.code !== 'ENOENT' &&
      !err.message.includes('does not exist')
    ) {
      console.error('❌ Session store test failed:', err);
      process.exit(1);
    } else {
      console.log('✅ Session store test passed');
      console.log('🎉 All tests passed! DATABASE_URL should work.');
      process.exit(0);
    }
  });
} catch (error) {
  console.error('❌ Failed to create PGStore:', error);
  process.exit(1);
}
