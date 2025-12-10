import { prisma } from "./lib/db";
import dotenv from 'dotenv';
dotenv.config();
async function testPrisma() {
    try {
        console.log("Testing Prisma connection...");
        // Try to query users
        const users = await prisma.user.findMany();
        console.log("Users in database:", users.length);
        // Try to count users
        const count = await prisma.user.count();
        console.log("User count:", count);
        console.log("Prisma connection successful!");
    }
    catch (error) {
        console.error("Prisma connection error:", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Stack trace:", error.stack);
        }
    }
    finally {
        await prisma.$disconnect();
    }
}
testPrisma();
