import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import ConnectDB from '@/config/db';
import { ProfileModel } from '@/model/ProfileModel';

export const runtime = 'nodejs';

export async function POST() {
    try {
        await ConnectDB();

        const filePath = path.join(process.cwd(), 'src', 'data', 'profiles.json');
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(rawData);

        // data keys are like "Bangladesh_bn_BD", "USA_en_US", etc.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allProfiles: any[] = [];

        for (const key of Object.keys(data)) {
            const profilesArray = data[key];
            if (!Array.isArray(profilesArray)) continue;

            // ---- Extract country and locale from the key ----
            const underscoreIdx = key.indexOf('_');          // find the first underscore
            if (underscoreIdx === -1) {
                // In case a key has no underscore (unlikely with your dataset)
                console.warn(`Skipping key with no underscore: ${key}`);
                continue;
            }
            const combinationCountry = key.substring(0, underscoreIdx);
            const combinationLocale = key.substring(underscoreIdx + 1);

            // ---- Enrich each profile with the combination info ----
            const enrichedProfiles = profilesArray.map((profile) => ({
                ...profile,
                combinationCountry,
                combinationLocale,
            }));

            allProfiles.push(...enrichedProfiles);
        }

        if (allProfiles.length === 0) {
            return NextResponse.json(
                { error: 'No profiles found in the file' },
                { status: 400 }
            );
        }

        // Optionally clear the collection before re-importing (idempotent import)
        // await Profile.deleteMany({});

        // Insert all profiles (skip duplicates on unique id violation)
        const inserted = await ProfileModel.insertMany(allProfiles, {
            ordered: false,
        });

        return NextResponse.json(
            {
                message: 'Profiles imported successfully',
                total: allProfiles.length,
                insertedCount: Array.isArray(inserted) ? inserted.length : undefined,
            },
            { status: 200 }
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error('Import error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}