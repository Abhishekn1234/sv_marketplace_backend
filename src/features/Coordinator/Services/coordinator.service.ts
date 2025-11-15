import { User } from "../../Auth/Models/User";
import { generateAccessToken, generateRefreshToken } from "../../../utils/Auth_token/tokenUtils";
import { validateCoordinatorInput } from "../../../utils/validations/Coordinator/validators";

export const registerCoordinatorService = async (
  fullName: string,
  email: string,
  phone: string,
  password: string
) => {
  validateCoordinatorInput(fullName, email, phone, password);

  const exists = await User.findOne({ $or: [{ email }, { phone }] });
  if (exists) throw new Error("Coordinator already exists");

  const user = await User.create({
    fullName,
    email,
    phone,
    password,
    role: "coordinator",
  });

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id, user.role);

  await user.save();

  return {
    user,
    accessToken,
    refreshToken,
  };
};
