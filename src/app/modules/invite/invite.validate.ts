import z from "zod";

export const createInviteSchema = z.object({
  email: z
    .email({ message: "Invalid email address" })
    .min(1, "Email is required")
    .max(100, "Email must be at most 100 characters"),
  role: z.string("Role is required").min(1).max(50),
  organizationId: z.string("Organization ID is required"),
  inviterId: z.string("Inviter ID is required"),
  name: z.string().optional(),
});
