// import { Organization } from "../../../../prisma/src/generated/prisma/client";
import { Organization } from "../../../../prisma/src/generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createOrganization = async (
  payload: Organization,
): Promise<Organization> => {
  const organization = await prisma.organization.create({
    data: {
      name: payload.name,
      slug: payload.slug,
    },
  });
  return organization;
};

export const OrganizationService = {
  createOrganization,
};
