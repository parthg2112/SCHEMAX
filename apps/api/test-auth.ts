import { auth } from "./lib/auth";
import dotenv from "dotenv";

dotenv.config();

async function testAuth() {
    try {
        console.log("Testing BetterAuth configuration...");
        console.log("Database URL set:", !!process.env.DATABASE_URL);
        console.log("BetterAuth Secret set:", !!process.env.BETTER_AUTH_SECRET);

        // Try to sign up a user
        console.log("\n=== Testing Sign Up ===");
        const signUpRequest = new Request("http://localhost:3001/api/auth/sign-up/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: "test@example.com",
                password: "testpass123",
                name: "Test User",
            }),
        });

        const signUpResponse = await auth.api.handler(signUpRequest);
        const signUpData = await signUpResponse.json();
        console.log("Sign up response:", signUpData);
        console.log("Response status:", signUpResponse.status);

    } catch (error) {
        console.error("Error testing auth:", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Stack trace:", error.stack);
        }
    }
}

testAuth();
