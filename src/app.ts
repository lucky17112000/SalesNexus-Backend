import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./app/lib/prisma";

const app: Application = express();

dotenv.config();

app.use(cors()); // ফ্রন্টএন্ড (Next.js) থেকে API কল করার অনুমতি দেয়
app.use(express.json()); // JSON বডি পার্স করা
app.use(express.urlencoded({ extended: true })); // URL-এনকোডেড ফর্ম ডেটা পার্স করা

app.get("/", async (req: Request, res: Response) => {
  const result = await prisma.organization.create({
    data: {
      name: "SalesNexus",
      slug: "salesnexus",
    },
  });
  res.status(200).json({ message: "Hello, World!", data: result });
});

export default app;
