/**
 * Migration: Approach 6 — Convert Policy.premium from String to Number
 *
 * What it does:
 * 1. Reads every policy document directly from MongoDB (bypasses Mongoose schema).
 * 2. Derives the numeric value from the existing String `premium` field.
 *    Falls back to `premiumNumeric` if it was already computed.
 * 3. Overwrites `premium` with the numeric value (Number type).
 * 4. Stores the original display string in a new `premiumDisplay` field.
 * 5. Removes the `premiumNumeric` field from every document.
 *
 * Run this BEFORE deploying the updated schema / application code:
 *   node migrations/migrate-premium-approach6.js
 *
 * Safety:
 * - Uses the raw MongoDB driver so Mongoose type validation does not interfere.
 * - Keeps the original string intact in `premiumDisplay` so nothing is lost.
 */

require("dotenv").config();
const { MongoClient } = require("mongodb");

const { DB_USER, DB_PASS } = process.env;

if (!DB_USER || !DB_PASS) {
  console.error("❌ DB_USER or DB_PASS is missing in .env");
  process.exit(1);
}

const uri =
  `mongodb://${DB_USER}:${DB_PASS}@ac-gonaqz9-shard-00-00.bmunlsr.mongodb.net:27017,` +
  `ac-gonaqz9-shard-00-01.bmunlsr.mongodb.net:27017,` +
  `ac-gonaqz9-shard-00-02.bmunlsr.mongodb.net:27017` +
  `/trustLife_db?ssl=true&replicaSet=atlas-1xbkmz-shard-0&authSource=admin` +
  `&retryWrites=true&w=majority&appName=Cluster0`;

async function migrate() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("trustLife_db");
    const policies = db.collection("policies");

    const cursor = policies.find({});
    let migrated = 0;

    for await (const doc of cursor) {
      const originalPremium = doc.premium;

      // Prefer the already-computed numeric value if it exists;
      // otherwise parse it from the original string.
      let numericValue =
        doc.premiumNumeric ??
        parseFloat(String(originalPremium).replace(/[^0-9.]/g, ""));

      if (isNaN(numericValue)) numericValue = 0;

      await policies.updateOne(
        { _id: doc._id },
        {
          $set: {
            premium: numericValue,
            premiumDisplay: String(originalPremium ?? ""),
          },
          $unset: { premiumNumeric: "" },
        }
      );

      migrated++;
      console.log(
        `✅ Migrated policy ${doc._id}: "${originalPremium}" → ${numericValue}`
      );
    }

    console.log(`\n🎉 Migration complete. ${migrated} policies updated.`);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

migrate();
