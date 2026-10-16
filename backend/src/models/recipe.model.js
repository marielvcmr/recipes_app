// What a recipe looks like in mongodb
import mongoose from 'mongoose';
import { DIFFICULTIES, UNITS } from '../utils/fieldRules.js';
import { normalizeName } from '../utils/normalizer.js';

const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true, enum: UNITS },
  },
  { _id: false },
);

const stepSchema = new mongoose.Schema(
  {
    position: { type: Number, required: true },
    description: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const recipeSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    nameNormalized: { type: String, required: true },
    description: { type: String, required: true, trim: true },
    timeMinutes: { type: Number, required: true },
    difficulty: { type: String, required: true, enum: DIFFICULTIES },
    isPublic: { type: Boolean, default: false },
    ingredients: [ingredientSchema],
    steps: [stepSchema],
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

recipeSchema.pre('validate', function () {
  if (this.isModified('name')) {
    this.nameNormalized = normalizeName(this.name);
  }
});

recipeSchema.index({ owner: 1, nameNormalized: 1 }, { unique: true });
recipeSchema.index({ isPublic: 1, nameNormalized: 1 });

export const Recipe = mongoose.model('Recipe', recipeSchema);
