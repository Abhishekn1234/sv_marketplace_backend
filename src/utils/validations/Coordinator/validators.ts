// utils/validators.ts

export const nameRegex = /^[A-Za-z\s]{3,}$/;
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^\+\d{1,3}\s?[1-9]\d{9}$/;
export const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,12}$/;

export const validateCoordinatorInput = (
  fullName: string,
  email: string,
  phone: string,
  password: string
) => {
  if (!nameRegex.test(fullName))
    throw new Error("Full name must be at least 3 characters long and contain only letters");

  if (!emailRegex.test(email))
    throw new Error("Invalid email format");

  if (!phoneRegex.test(phone))
    throw new Error("Invalid phone number. Must include country code and 10 digits");

  if (!passwordRegex.test(password))
    throw new Error("Password must be 8–12 characters long and contain letters and numbers");
};
