import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import erdGenRouter from "./router/erd-gen";
import prismaGenRouter from "./router/prisma-gen";
import projectRouter from "./router/project";

dotenv.config();

const app = express();
app.use(bodyParser.json({ limit: "1000mb" }));
const port = process.env.PORT || 3000;

app.all('/api/auth/{*any}', toNodeHandler(auth));

app.use(express.json());
app.use("/erd", erdGenRouter);
app.use("/prisma", prismaGenRouter);
app.use("/project", projectRouter);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});