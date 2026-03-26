export type Settings = {
  logo?: string;
  isRazorpay?: boolean;
  razorpayApiKey?: string | null;
  razorpayApiSecret?: string | null;
  isPhonePe?: boolean;
  phonePeApiKey?: string | null;
  phonePeApiSecret?: string | null;
  phonePeVersion?: string | null;  link?: string | null;
  address?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  socialMediaLinks?: {
    facebook?: string | null;
    twitter?: string | null;
    instagram?: string | null;
    linkedin?: string | null;
  };
  isDeleted?: boolean;
};

