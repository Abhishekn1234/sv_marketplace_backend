import cloudinary from "../../../config/cloudinary";
import { IUser, userRepo, UpdateBioData, sanitizeUser, emailRegex, phoneRegex, KYCRepo } from "shared-lib";

export const UserService = {
  async updateBio(
    userId: string,
    body: UpdateBioData,
    file?: Express.Multer.File
  ): Promise<IUser> {
    const { fullName, email, phone, nationality, dob, address, bio } = body;

    if (phone && !phoneRegex.test(phone)) {
      throw new Error("Invalid phone number");
    }

    if (email && !emailRegex.test(email)) {
      throw new Error("Invalid email");
    }

    if (phone) {
      const existingPhoneUser = await userRepo.findUserByPhoneExcludingId(phone, userId);
      if (existingPhoneUser && existingPhoneUser._id.toString() !== userId) {
        throw new Error("Phone number already in use");
      }
    }

    if (email) {
      const existingEmailUser = await userRepo.findUserByEmailExcludingId(email, userId);
      if (existingEmailUser && existingEmailUser._id.toString() !== userId) {
        throw new Error("Email already in use");
      }
    }

    let newImageUrl: string | undefined;
    let newPublicId: string | undefined;

    if (file) {
      newImageUrl = file.path;
      newPublicId = (file as any).filename;

      const user = await userRepo.findUserById(userId);

      if (user?.profilePicturePublicId) {
        await cloudinary.uploader.destroy(user.profilePicturePublicId);
      }
    }
    const kycdocuments=await KYCRepo.findLatestByUser(userId);


    const updatedUser = await userRepo.updateUserById(userId, {
      fullName,
      phone,
      email,
      documents:kycdocuments??[],
      nationality,
      dob: dob ? new Date(dob) : undefined,
      address,
      bio,
      ...(newImageUrl && { profilePictureUrl: newImageUrl }),
      ...(newPublicId && { profilePicturePublicId: newPublicId }),
    });

    if (!updatedUser) throw new Error("User not found");

    return sanitizeUser(updatedUser);
  },
};
