import { User, IUser } from "../Models/User";
import bcrypt from "bcryptjs";

export const userRepo = {
  async findById(id: string) {
    return User.findById(id);
  },
 async findUserByEmailOrPhone(email: string, phone: string) {
    return User.findOne({
      $or: [{ email }, { phone }],
    });
  },
  async findUserByEmailExcludingId(email: string, excludeUserId: string) {
  return User.findOne({
    email,
    _id: { $ne: excludeUserId }, // _id not equal to this ID
  });
},
async findUserByPhoneExcludingId(phone: string, excludeUserId: string) {
  return User.findOne({phone,_id:{$ne:excludeUserId}});
},

   async findUserByEmail(email: string) {
    return User.findOne({email});
  },
   async findUserByPhone( phone: string) {
    return User.findOne({phone });
  },
    async findUserById(userId: string) {
    return User.findById(userId);
  },
  async findByIdentifier(identifier: string) {
    return User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });
  },

  async findBySocialId(socialId: string) {
    return User.findOne({ socialId });
  },

  async checkExistingUser(email: string, phone: string) {
    return User.findOne({
      $or: [{ email }, { phone }],
    });
  },

  async createUser(data: Partial<IUser>) {
    return User.create(data);
  },

  async updateUserById(id: string, update: Partial<IUser>) {
    return User.findByIdAndUpdate(id, update, { new: true });
  },
  updateKYCStatus(userId: string, status: string) {
    return User.findByIdAndUpdate(
      userId,
      { kycStatus: status },
      { new: true }
    );
  },
  
  findByIdLean(userId: string) {
    return User.findById(userId).lean();
  },

  async changePassword(id: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return User.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true }
    );
  },
};
