import { Gender } from "../../../generated/prisma/enums";

export interface ISuperAdminFilterRequest {
  name?: string;
  email?: string;
}

export interface IUpdateSuperAdmin {
  name?: string;
  email?: string;
  profilePhoto?: string;
  contactNumber?: string;
  address?: string;
  gender?: Gender;
}
