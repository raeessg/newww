import { MongoClient } from "mongodb";

import dotenv from "dotenv";
dotenv.config();
// Replace with your connection string
const uri = "mongodb+srv://codewithraees:9Z0PHumNYcshAWyL@cluster0.9qc6x.mongodb.net/attendance?retryWrites=true&w=majority&appName=Cluster0"

const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        console.log("Connected to MongoDB Atlas");

        const database = client.db("attendance"); // Replace with your database name
        const collection = database.collection("students"); // Replace with your collection name

        const data = [
            {
                serialNumber: "11",
                name: "Anjali Sharma",
                rollNumber: "27300122132",
                registrationNumber: "22273030334",
                phoneNumber: "9823232333",
                presentPercentage: "89%",
                alternativePhoneNumber: "9835633901",
                email: "example11@gmail.com"
            }
        ];

        // Insert data
        const result = await collection.insertMany(data);
        console.log(`${result.insertedCount} documents were inserted`);
    } finally {
        await client.close();
    }
}

run().catch(console.dir);
