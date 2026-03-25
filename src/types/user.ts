export type User = {
  firstName?: string;
  lastName?: string;
  email: string;
  contact?: {
    countryCode?: string;
    phoneNo?: number;
  };
  roles?: string;
  password?: string;
  otp?: number | null;
  otpExpireTime?: Date | null;
  isActive?: boolean;
  isDeleted?: boolean;
};
