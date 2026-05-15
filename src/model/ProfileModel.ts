import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProfile extends Document {
    id: string;
    gender: "male" | "female";
    name: {
        first: string;
        last: string;
        full: string;
    };
    email: string;
    phone: string;
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
    };
    dateOfBirth: string;
    age: number;
    username: string;
    avatar: string;
    website: string;
    company: {
        name: string;
        catchPhrase: string;
    };
    family: {
        father: { name: string };
        mother: { name: string };
        siblings: Array<{
            name: string;
            gender: "male" | "female";
            relation: "brother" | "sister";
        }>;
    };
    // ----- Track the dataset combination -----
    combinationCountry: string; // e.g., "Bangladesh"
    combinationLocale: string; // e.g., "bn_BD"
}

const SiblingSchema = new Schema({
    name: { type: String, required: true },
    gender: { type: String, enum: ["male", "female"], required: true },
    relation: { type: String, enum: ["brother", "sister"], required: true },
});

const FamilySchema = new Schema({
    father: {
        name: { type: String, required: true },
    },
    mother: {
        name: { type: String, required: true },
    },
    siblings: [SiblingSchema],
});

const ProfileSchema = new Schema<IProfile>(
    {
        id: { type: String, required: true, unique: true },
        gender: { type: String, enum: ["male", "female"], required: true },
        name: {
            first: { type: String, required: true },
            last: { type: String, required: true },
            full: { type: String, required: true },
        },
        email: { type: String, required: true },
        phone: String,
        address: {
            street: String,
            city: String,
            state: String,
            country: String,
            zipCode: String,
        },
        dateOfBirth: String,
        age: Number,
        username: String,
        avatar: String,
        website: String,
        company: {
            name: String,
            catchPhrase: String,
        },
        family: FamilySchema,
        combinationCountry: { type: String, index: true },
        combinationLocale: { type: String, index: true },
    },
    { timestamps: true },
);

// Compound index for common queries (country + locale)
ProfileSchema.index({ combinationCountry: 1, combinationLocale: 1 });

export const ProfileModel: Model<IProfile> =
    mongoose.models.Profile || mongoose.model<IProfile>("Profile", ProfileSchema);
