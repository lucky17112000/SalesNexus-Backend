import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./app/lib/prisma";
import { OrganizationRoutes } from "./app/modules/organization/organization.route";
import { IndexRouter } from "./app/routes";
import { globalErrorHandler } from "./app/middlware/globalErrorHandler";
import { notFound } from "./app/middlware/notFound";

const app: Application = express();

dotenv.config();

app.use(cors()); // ফ্রন্টএন্ড (Next.js) থেকে API কল করার অনুমতি দেয়
app.use(express.json()); // JSON বডি পার্স করা
app.use(express.urlencoded({ extended: true })); // URL-এনকোডেড ফর্ম ডেটা পার্স করা

app.use("/api/v1", IndexRouter); // Organization রাউটস যোগ করা

app.get("/", async (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello, World!" });
});

// global error handling middleware
app.use(globalErrorHandler);
app.use(notFound); // 404 not found middleware

export default app;
