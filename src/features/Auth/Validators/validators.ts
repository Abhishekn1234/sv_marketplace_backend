

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^\+\d{1,3}\s?\d{10}$/;
export const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,12}$/;

export const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

  export const BioRegex = /^(?:\b\w+\b[\s]*){50,}$/;
export const AddressRegex = /^[a-zA-Z0-9\s,.'-]{10,}$/;

export const validateRegistrationInputs = (
  email: string,
  phone: string,
  password: string
) => {
  if (!emailRegex.test(email)) throw new Error("Invalid email format");

  if (!phoneRegex.test(phone))
    throw new Error("Invalid phone number. Must include country code + 10 digits");

  if (!passwordRegex.test(password))
    throw new Error(
      "Password must be 8–12 characters long and contain letters & numbers"
    );
};
export const validateIdentifier = (identifier: string) => {
  if (!identifier) throw new Error("Identifier required");
};


