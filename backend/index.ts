import express from "express";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { erdGenRouter } from "./router/erd-gen";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.all('/api/auth/{*any}', toNodeHandler(auth));

app.use(express.json());
app.use("/erd", erdGenRouter);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});