// Setup script for email verification migration
// Run this once after deploying: node scripts/setup-email-verification.js

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🚀 Starting email verification setup...\n');

  // Check for required environment variables
  if (!process.env.POSTGRES_URL) {
    console.error('❌ Error: POSTGRES_URL environment variable is not set');
    console.log('Please set it in your .env.local file or Vercel dashboard');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('📡 Connecting to database...');
    const client = await pool.connect();
    console.log('✅ Connected to database\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '../lib/db/migrations/add_email_verification.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Running migration...');
    console.log('---');
    console.log(migrationSQL);
    console.log('---\n');

    // Run migration
    await client.query(migrationSQL);
    console.log('✅ Migration completed successfully!\n');

    // Verify the changes
    console.log('🔍 Verifying migration...');
    const result = await client.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE email_verified = TRUE) as verified_users,
        COUNT(*) FILTER (WHERE email_verified = FALSE) as unverified_users
      FROM users
    `);

    const stats = result.rows[0];
    console.log('✅ Verification complete:');
    console.log(`   Total users: ${stats.total_users}`);
    console.log(`   Verified users: ${stats.verified_users}`);
    console.log(`   Unverified users: ${stats.unverified_users}\n`);

    if (stats.verified_users === stats.total_users) {
      console.log('🎉 All existing users have been auto-verified!');
    }

    client.release();
    await pool.end();

    console.log('\n✅ Setup complete! You can now deploy your application.');
    console.log('📝 New users will need to verify their email before downloading.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    await pool.end();
    process.exit(1);
  }
}

runMigration();

