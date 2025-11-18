export const sanitizeUser = (user: any) => {
  const { 
    password, 
    otp, 
    __v, 
    refreshToken, 
    accessToken, 
    resetPasswordToken,
    resetPasswordExpires,
    resetPasswordExpire,
    lastLoginDate,
    lastLoginTime,
    logoutTime,
    logoutDate,
    duration,
    LoginDate,
    LoginTime,
    ...rest 
  } = user;
  return rest;
};

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^\+\d{1,3}\s?\d{10}$/;
export const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,12}$/;

export const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;