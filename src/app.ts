import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

const app: Application = express();

dotenv.config();

app.use(cors()); // ফ্রন্টএন্ড (Next.js) থেকে API কল করার অনুমতি দেয়
app.use(express.json()); // JSON বডি পার্স করা
app.use(express.urlencoded({ extended: true })); // URL-এনকোডেড ফর্ম ডেটা পার্স করা

app.get("/", (req: Request, res: Response) => {
  res.send("🏢 Welcome to SalesNexus CRM API. Visit /health for status.");
});

export default app;
