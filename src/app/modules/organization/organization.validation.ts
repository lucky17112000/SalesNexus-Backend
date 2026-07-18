import z from "zod";

export const createOrganizationSchema = z.object({
  name: z.string("Name is required").min(1).max(100),
  slug: z.string("Slug is required").min(1).max(100),
});
