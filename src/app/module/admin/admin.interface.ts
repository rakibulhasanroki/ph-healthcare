import { Gender } from "../../../generated/prisma/enums";

export interface IAdminFilterRequest {
  name?: string;
  email?: string;
}

export interface IUpdateAdmin {
  name?: string;
  email?: string;
  profilePhoto?: string;
  contactNumber?: string;
  address?: string;
  gender?: Gender;
}
