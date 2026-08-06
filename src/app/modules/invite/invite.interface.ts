export interface IInvitePayload {
  email: string;
  role: string;
  organizationId: string;
  inviterId: string;
  name?: string;
}

export interface IRegisterWithInvitePayload {
  name: string;
  email: string;
  password: string;
  inviteToken: string;
}
