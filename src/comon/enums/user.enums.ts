export enum ProviderEnum {
  GOOGLE = "GOOGLE",
  SYSTEM = "SYSTEM",
}

export enum GenderEnum {
  MALE = "Male",
  FEMALE = "Female",
}

export enum RoleEnum {
  USER = "User",
  ADMIN = "Admin",
}


export enum OtpEnum {
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
  PASSWORD_RESET = "PASSWORD_RESET",
  RESTORE_ACCOUNT = "RESTORE_ACCOUNT",
}

export enum FileMimeTypes {
  JPEG = "image/jpeg",
  JPG = "image/jpg",
  PNG = "image/png",
  WEBP = "image/webp",
}
export const imageMimeTypes = [
  FileMimeTypes.JPEG,
  FileMimeTypes.JPG,
  FileMimeTypes.PNG,
  FileMimeTypes.WEBP,
];
export enum EmployeeRangeEnum {
  RANGE_1_10 = "1-10",
  RANGE_11_20 = "11-20",
  RANGE_21_50 = "21-50",
  RANGE_51_100 = "51-100",
  RANGE_101_200 = "101-200",
  RANGE_201_500 = "201-500",
  RANGE_500_PLUS = "500+",
}

export enum JobLocationEnum {
  ONSITE = "onsite",
  REMOTELY = "remotely",
  HYBRID = "hybrid",
}

export enum WorkingTimeEnum {
  PART_TIME = "part-time",
  FULL_TIME = "full-time",
}

export enum SeniorityLevelEnum {
  FRESH = "fresh",
  JUNIOR = "Junior",
  MID_LEVEL = "Mid-Level",
  SENIOR = "Senior",
  TEAM_LEAD = "Team-Lead",
  CTO = "CTO",
}

export enum ApplicationStatusEnum {
  PENDING = "pending",
  ACCEPTED = "accepted",
  VIEWED = "viewed",
  IN_CONSIDERATION = "in consideration",
  REJECTED = "rejected",
}

export enum TokenTypeEnum{
  ACCESS = "ACCESS",
  REFRESH = "REFRESH",  
}