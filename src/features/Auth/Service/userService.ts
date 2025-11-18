// services/userService.ts
import cloudinary from "../../../config/cloudinary";
import { IUser } from "../Models/User";
import { userRepo } from "../Repositories/user";
import { UpdateBioData } from "../Types/Response";
import { AddressRegex, BioRegex, emailRegex, phoneRegex } from "../Validators/validators";

export const UserService = {
  async updateBio(
    userId: string,
    body: UpdateBioData,
    file?: Express.Multer.File
  ): Promise<IUser> {
    const { fullName,email, phone, nationality, dob, address, bio } = body;

    console.log("Updating bio for user:", userId);
    console.log("Body data:", body);
     if( phone && !phoneRegex.test(phone)){
      throw new Error("Invalid phone number");
     }
     if( email && !emailRegex.test(email)){
      throw new Error("Invalid email");
     }
     if( bio && !BioRegex.test(bio)){
      throw new Error("Bio should be atleast 50 characters")
     }
     

    let newImageUrl: string | undefined;
    let newPublicId: string | undefined;
       if (phone) {
      const existingPhoneUser = await userRepo.findUserByPhoneExcludingId(phone,userId);
      if (existingPhoneUser && existingPhoneUser._id.toString() !== userId) {
        throw new Error("Phone number already in use");
      }
    }

    // Check for unique email
    if (email) {
      const existingEmailUser = await userRepo.findUserByEmailExcludingId(email,userId);
      if (existingEmailUser && existingEmailUser._id.toString() !== userId) {
        throw new Error("Email already in use");
      }
    }
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
      email,
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