import status from "http-status";
import AppError from "../../errorHelper/AppError";
import { prisma } from "../../lib/prisma";
import { IInvitePayload } from "./invite.interface";
import { randomBytes } from "crypto";
import { envVars } from "../../../config/env";
import { sendEmail } from "../../utils/email";
import { InvitationStatus } from "../../../../prisma/src/generated/prisma/enums";

const INVITE_EXPIRY_DAYS = parseInt(process.env.INVITE_EXPIRY_DAYS || "2", 10);
const createInvite = async (payload: IInvitePayload, inviterId: string) => {
  const { email, role, organizationId, name } = payload;

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!organization) {
    throw new AppError(status.NOT_FOUND, "Organization not found");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    const existingMember = await prisma.member.findFirst({
      where: { userId: existingUser.id, organizationId },
    });
    if (existingMember) {
      throw new AppError(
        status.CONFLICT,
        "User is already a member of the organization",
      );
    }
  }

  //!SECTION unique token generation

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(
    Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  );

  const invite = await prisma.invitation.create({
    data: {
      email,
      role,
      organizationId,
      inviterId,
      token,
      expiresAt,
      status: InvitationStatus.PENDING,
    },
  });

  const frontendUrl = envVars.FRONTEND_URL || "http://localhost:3000";
  const inviteLink = `${frontendUrl}/register?token=${token}`;

  await sendEmail({
    to: email,
    subject: `You're invited to join ${organization.name}`,
    templateName: "invite",
    templateData: {
      name: name || "there",
      organizationName: organization.name,
      role: role || "member",
      inviteLink,
      expiryDays: INVITE_EXPIRY_DAYS,
    },
  });
  return { invite, inviteLink };
};

const validateInviteToken = async (token: string) => {
  const invite = await prisma.invitation.findFirst({
    where: {
      token,
      status: InvitationStatus.PENDING,
      expiresAt: { gt: new Date() },
    },
  });

  if (!invite) {
    throw new AppError(status.NOT_FOUND, "Invalid or expired invite token");
  }
  return invite;
};

const markInviteAsAccepted = async (inviteId: string) => {
  await prisma.invitation.update({
    where: { id: inviteId },
    data: { status: InvitationStatus.USED },
  });
};

export const inviteService = {
  createInvite,
  validateInviteToken,
  markInviteAsAccepted,
};
