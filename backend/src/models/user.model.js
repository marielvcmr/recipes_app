// What the user looks like in mongodb
import mongoose from 'mongoose';
import { USERNAME_REGEX, HEX_COLOR_REGEX } from '../utils/fieldRules.js';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      match: USERNAME_REGEX,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    avatarColor: {
      type: String,
      match: HEX_COLOR_REGEX,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.passwordHash;
        return ret;
      },
    },
  },
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index(
  { username: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } },
);

export const User = mongoose.model('User', userSchema);
