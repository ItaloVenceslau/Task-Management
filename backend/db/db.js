
const { MongoClient } = require('mongodb');
require('dotenv').config();

let client = null;
let db = null;

async function connectDB() {
    try {
        const uri = process.env.MONGO_URI;
        const dbName = process.env.DB_NAME;
        
        client = new MongoClient(uri);
        await client.connect();
        console.log("✅ Connected to MongoDB Atlas");
        
        db = client.db(dbName);
        
        // Create index on id field for faster lookups
        await db.collection('tasks').createIndex({ id: 1 }, { unique: true });
        console.log("✅ Indexes created");
        
        return db;
    } catch (error) {
        console.error("❌ Connection failed:", error.message);
        throw error;
    }
}

function getDB() {
    if (!db) {
        throw new Error("Database not connected. Call connectDB() first");
    }
    return db;
}

async function closeDB() {
    if (client) {
        await client.close();
        console.log("🔌 Disconnected from MongoDB");
    }
}


async function seedDatabase() {
    if (!db) {
        throw new Error("Database not connected");
    }
    
    const tasksCollection = db.collection('tasks');
    const taskCount = await tasksCollection.countDocuments();
    
    if (taskCount === 0) {
        console.log("📦 Seeding initial tasks...");
        
        await tasksCollection.insertMany([
            {
                id: 1,
                title: "Complete Express challenge",
                description: "Finish the middleware and routing exercise",
                status: "pending",
                createdAt: "2026-04-28T10:00:00.000Z"
            },
            {
                id: 2,
                title: "Review pull requests",
                description: "Check team's code submissions",
                status: "in-progress",
                createdAt: "2026-04-28T09:30:00.000Z"
            }
        ]);
        
        console.log("✅ Seed complete");
    } else {
        console.log(`📊 Database already has ${taskCount} tasks`);
    }
};


module.exports = { connectDB, getDB, closeDB, seedDatabase };

