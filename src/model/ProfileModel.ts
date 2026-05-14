import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProfile extends Document {
    id: string;
    gender: string;
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
        country: string;          // ← the country that appears in the profile's address
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
    // ----- Track the dataset combination -----
    combinationCountry: string;   // e.g., "Bangladesh"
    combinationLocale: string;    // e.g., "bn_BD"
}

const ProfileSchema = new Schema<IProfile>(
    {
        id: { type: String, required: true, unique: true },
        gender: String,
        name: {
            first: String,
            last: String,
            full: String,
        },
        email: String,
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
        combinationCountry: { type: String, index: true },
        combinationLocale: { type: String, index: true },
    },
    { timestamps: true }
);

// Compound index for common queries (country + locale)
ProfileSchema.index({ combinationCountry: 1, combinationLocale: 1 });

export const ProfileModel: Model<IProfile> =
    mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);