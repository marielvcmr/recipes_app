// What a group looks like in mongodb
import mongoose from 'mongoose';
import { normalizeName } from '../utils/normalizer.js';

const groupSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    nameNormalized: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.nameNormalized;
        return ret;
      },
    },
  },
);

groupSchema.pre('validate', function () {
  if (this.isModified('name')) {
    this.nameNormalized = normalizeName(this.name);
  }
});

groupSchema.index({ owner: 1, nameNormalized: 1 }, { unique: true });

export const Group = mongoose.model('Group', groupSchema);
