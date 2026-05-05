const { MongoClient } = require('mongodb');
require('dotenv').config();

let client = null;
let db = null;

async function connectDB() {
    try {
        const uri = process.env.MONGO_URI;
        const dbName = process.env.DB_NAME;
        
        if (!uri) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }
        
        if (!dbName) {
            throw new Error("DB_NAME is not defined in environment variables");
        }
        
        client = new MongoClient(uri);
        await client.connect();
        console.log("✅ Connected to MongoDB Atlas");
        
        db = client.db(dbName);
        
        const tasksCollection = db.collection('tasks');
        await tasksCollection.createIndex({ id: 1 }, { unique: true });
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
        db = null;
        client = null;
    }
}

async function seedDatabase() {
    if (!db) {
        throw new Error("Database not connected");
    }
    
    try {
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
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    title: "Review pull requests",
                    description: "Check team's code submissions",
                    status: "in-progress",
                    createdAt: new Date().toISOString()
                }
            ]);
            
            console.log("✅ Seed complete");
        } else {
            console.log(`📊 Database already has ${taskCount} tasks`);
        }
    } catch (error) {
        console.error("❌ Seeding failed:", error.message);
        throw error;
    }
}

module.exports = { connectDB, getDB, closeDB, seedDatabase };