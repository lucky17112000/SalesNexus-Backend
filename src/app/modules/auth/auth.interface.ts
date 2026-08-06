export interface IAdminSignupPayload {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}

export interface IchangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

// src/types/index.ts
export interface IRequestUser {
  userId: string;
  email: string;
  role?: string; // এখন আর Role enum না, স্ট্রিং
  status?: string;
  isDeleted?: boolean;
  organizationId?: string;
}
