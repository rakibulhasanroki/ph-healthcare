import { Gender, Role, UserStatus } from "../../../generated/prisma/enums";

export interface IAdminFilterRequest {
  name?: string;
  email?: string;
}

export interface IUpdateAdmin {
  admin?: {
    name?: string;
    email?: string;
    profilePhoto?: string;
    contactNumber?: string;
    address?: string;
    gender?: Gender;
  };
}

export interface IChangeUserStatus {
  userId: string;
  userStatus: UserStatus;
}

export interface IChangeUserRole {
  userId: string;
  role: Role;
}
