export const responseMessage = {
  loginSuccess: "Login successful!",
  signupSuccess: "Account created successfully!",
  onlyUserRegister: "Only user can register!",
  internalServerError: "Internal Server Error!",
  alreadyEmail: "Email is already registered!",
  emailUnverified: "Enter the OTP below to verify your email address!",
  accountBlock: "Your account has been blocked!",
  companyPlanExpired: "Your company plan has expired!",
  invalidUserPasswordEmail: "Invalid username or password!",
  invalidOTP: "Invalid OTP!",
  expireOTP: "OTP has expired!",
  OTPVerified: "OTP verified successfully!",
  otpSent: "OTP sent successfully!",
  otpSendFailed: "Failed to send OTP!",
  invalidEmail: "Invalid email!",
  emailVerificationComplete: "Email verification complete!",
  errorMail: "Error in mail system!",
  resetPasswordSuccess: "Password reset successfully!",
  resetPasswordError: "Error while resetting password!",
  oldPasswordError: "Old password is incorrect!",
  passwordChangeSuccess: "Password changed successfully!",
  passwordChangeError: "Error while changing password!",
  invalidOldTokenReFreshToken: "Invalid old token or refresh token!",
  refreshTokenNotFound: "Refresh token not found!",
  tokenNotExpire: "Token has not expired!",
  tokenExpire: "Token has expired!",
  refreshTokenSuccess: "New token generated successfully!",
  differentToken: "Do not use a different token!",
  tokenNotFound: "Token not found in header!",
  logout: "Logout successful!",

  // 🔥 Image Upload Related
  fileUploadSuccess: "Image uploaded successfully!",
  noFileUploaded: "No image uploaded!",
  unsupportedFileType: "Only image files are allowed!",
  fileTooLarge: "File size exceeds limit!",
  
  addDataError: "Oops! Something went wrong!",

  accessDenied: "Access denied",
  invalidToken: "Invalid token",

  // 🔹 Dynamic Messages
  customMessage: (message: string): any =>
    `${message[0].toUpperCase() + message.slice(1).toLowerCase()}`,

  invalidId: (message: string): any => `Invalid ${message}!`,

  dataAlreadyExist: (message: string): any =>
    `${message} already exists! Please use a different one.`,

  getDataSuccess: (message: string): any =>
    `${message[0].toUpperCase() + message.slice(1).toLowerCase()} retrieved successfully!`,

  addDataSuccess: (message: string): any =>
    `${message[0].toUpperCase() + message.slice(1).toLowerCase()} added successfully!`,

  getDataNotFound: (message: string): any =>
    `${message} not found!`,

  updateDataSuccess: (message: string): any =>
    `${message} updated successfully!`,

  updateDataError: (message: string): any =>
    `Error while updating ${message}!`,

  deleteDataSuccess: (message: string): any =>
    `${message} deleted successfully!`,
};