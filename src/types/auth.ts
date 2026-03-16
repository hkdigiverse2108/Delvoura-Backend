export type PhoneInput =
  | string
  | number
  | {
      countryCode?: string;
      phoneNo?: string | number;
      number?: string | number;
    };

export type PhonePayload = {
  countryCode?: string;
  phoneNo: string | number;
} | null;

export type SignupBody = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNo?: PhoneInput;
  countryCode?: string;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type VerifyOtpBody = {
  email: string;
  otp: string | number;
};
