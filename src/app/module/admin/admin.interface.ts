import { Gender } from "../../../generated/prisma/enums";

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
