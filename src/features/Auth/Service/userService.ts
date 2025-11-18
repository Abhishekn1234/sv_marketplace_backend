// services/userService.ts
import cloudinary from "../../../config/cloudinary";
import { IUser } from "../Models/User";
import { userRepo } from "../Repositories/user";
import { UpdateBioData } from "../Types/Response";

export const UserService = {
  async updateBio(
    userId: string,
    body: UpdateBioData,
    file?: Express.Multer.File
  ): Promise<IUser> {
    const { fullName, phone, nationality, dob, address, bio } = body;

    console.log("Updating bio for user:", userId);
    console.log("Body data:", body);

    let newImageUrl: string | undefined;
    let newPublicId: string | undefined;

    // If a new file is uploaded
    if (file) {
      newImageUrl = file.path;
      newPublicId = (file as any).filename;

      const user = await userRepo.findUserById(userId);

      // Delete old cloudinary image if exists
      if (user?.profilePicturePublicId) {
        await cloudinary.uploader.destroy(user.profilePicturePublicId);
      }
    }

    const updatedUser = await userRepo.updateUserById(userId, {
      fullName,
      phone,
      nationality,
     dob: dob ? new Date(dob) : undefined, // convert string to Date if present
      address,
      bio,
      ...(newImageUrl && { profilePictureUrl: newImageUrl }),
      ...(newPublicId && { profilePicturePublicId: newPublicId }),
    });

    if (!updatedUser) throw new Error("User not found");

    console.log("Updated user:", updatedUser);

    return updatedUser;
  },
};