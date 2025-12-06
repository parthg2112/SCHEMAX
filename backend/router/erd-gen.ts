import { Router } from "express";
import { generateErd } from "../handlers/erd-gen";

const erdGenRouter = Router();

erdGenRouter.post("/generate", generateErd);

export { erdGenRouter };