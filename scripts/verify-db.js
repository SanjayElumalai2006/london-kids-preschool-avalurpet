/**
 * London Kids Preschool Avalurpet - Database Verification Script
 * Checks database configuration, connectivity, reachability, and active read/write/save capabilities.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Load environment variables from .env.local
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const idx = trimmed.indexOf('=');
        if (idx !== -1) {
          const key = trimmed.slice(0, idx).trim();
          const val = trimmed.slice(idx + 1).trim();
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    });
  }
}

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pre-school';

async function verifyDatabase() {
  console.log('====================================================');
  console.log('      DATABASE CONNECTIVITY & HEALTH VERIFICATION   ');
  console.log('====================================================');
  console.log(`Configured URI: ${MONGODB_URI}`);

  const startTime = Date.now();

  try {
    console.log('\n[1/4] Attempting connection to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    });

    const elapsed = Date.now() - startTime;
    console.log(`[SUCCESS] Connected to MongoDB in ${elapsed}ms.`);
    console.log(`Connection state: ${mongoose.connection.readyState} (1 = connected)`);
    console.log(`Target Database: "${mongoose.connection.name}"`);

    console.log('\n[2/4] Inspecting existing collections and document counts...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections:`);

    const collectionSummary = [];
    for (const col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      collectionSummary.push({ name: col.name, count });
      console.log(`  - ${col.name.padEnd(22)} : ${count} documents`);
    }

    console.log('\n[3/4] Testing Active Write & Save capability...');
    const testId = `verify_test_${Date.now()}`;
    const testDoc = {
      testId,
      message: 'Active write verification test for London Kids Preschool',
      timestamp: new Date(),
      status: 'VERIFICATION_PASSED',
    };

    const testCollection = mongoose.connection.db.collection('_db_health_checks');
    const insertResult = await testCollection.insertOne(testDoc);
    console.log(`[SUCCESS] Document inserted with _id: ${insertResult.insertedId}`);

    console.log('\n[4/4] Verifying Data Persistence (Read & Verification)...');
    const fetchedDoc = await testCollection.findOne({ testId });
    if (!fetchedDoc || fetchedDoc.status !== 'VERIFICATION_PASSED') {
      throw new Error('Data persistence check failed: Document could not be retrieved.');
    }
    console.log(`[SUCCESS] Retrieved saved document matching testId: "${fetchedDoc.testId}"`);

    // Clean up
    await testCollection.deleteOne({ testId });
    console.log('[SUCCESS] Cleaned up temporary test document.');

    console.log('\n====================================================');
    console.log('   VERIFICATION RESULT: DATABASE IS FULLY HEALTHY   ');
    console.log('====================================================');
    console.log('• Reachability: OK (Reachable and responding)');
    console.log(`• Database Name: "${mongoose.connection.name}"`);
    console.log(`• Total Collections: ${collections.length}`);
    console.log('• Data Read Capability: OK');
    console.log('• Data Save/Write Capability: OK');
    console.log('• Data Deletion/Cleanup: OK');
    console.log('====================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n[ERROR] Database verification failed:');
    console.error(error.message);

    if (error.message.includes('ECONNREFUSED')) {
      console.log('\nTROUBLESHOOTING TIP:');
      console.log('The local MongoDB service is not currently running on port 27017.');
      console.log('To start MongoDB on Windows:');
      console.log('  1. Open Services (services.msc) and start "MongoDB Server".');
      console.log('  2. Or run: "net start MongoDB" in an administrator command prompt.');
      console.log('  3. Or run the project launcher: "start-server.bat"');
      console.log('If you are using MongoDB Atlas in the cloud, ensure MONGODB_URI in .env.local has your Atlas connection string.');
    }

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect().catch(() => {});
    }
    process.exit(1);
  }
}

verifyDatabase();
