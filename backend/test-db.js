require('dotenv').config();
const { MongoClient } = require('mongodb');

async function testConnection() {
    console.log("Testing MongoDB connection...");
    console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
    console.log("DB_NAME:", process.env.DB_NAME);
    
    if (!process.env.MONGO_URI) {
        console.error("❌ MONGO_URI not found in environment variables");
        return;
    }
    
    try {
        const client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
        console.log("✅ Successfully connected to MongoDB!");
        
        const db = client.db(process.env.DB_NAME);
        const collections = await db.listCollections().toArray();
        console.log("📚 Collections:", collections.map(c => c.name));
        
        await client.close();
        console.log("✅ Connection test completed");
    } catch (error) {
        console.error("❌ Connection failed:", error.message);
    }
}

testConnection();