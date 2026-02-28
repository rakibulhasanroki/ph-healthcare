export interface ICreateMyDoctorSchedulePayload {
  scheduleIds: string[];
}

export interface IUpdateMyDoctorSchedulePayload {
  scheduleIds: {
    shouldDelete: boolean;
    id: string;
  }[];
}
