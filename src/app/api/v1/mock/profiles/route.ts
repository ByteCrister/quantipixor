// app/api/profiles/route.ts

import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import ConnectDB from '@/config/db';
import { checkRateLimit } from '@/lib/checkRateLimit'; // adjust path as needed
import { ProfileModel } from '@/model/ProfileModel';
import { GeneratedProfile } from '@/types/mock-profile';
import { COUNTRIES, LOCALES } from '@/const/mock-profile';

// Maximum number of profiles to return
const MAX_COUNT = 15;
const RATE_LIMIT_PURPOSE = 'profiles-api';

/**
 * Extracts a stable user identifier from the request.
 * Falls back to IP address if no authentication is present.
 */
function getUserIdFromRequest(request: NextRequest): string {
    // Try to get user ID from authentication token/session (customize as needed)
    // For public endpoints, use IP address (or X-Forwarded-For)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0] ?? request.headers.get('x-real-ip') ?? 'anonymous';
    return `ip:${ip}`;
}

/**
 * GET /api/profiles
 * Returns random user profiles with optional filtering.
 * Rate‑limited per minute to prevent abuse.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        await ConnectDB();

        // --- Rate limiting ---
        const userId = getUserIdFromRequest(request);
        const isAllowed = await checkRateLimit(RATE_LIMIT_PURPOSE, userId, 'minute');

        if (!isAllowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        // --- Parse query parameters ---
        const { searchParams } = new URL(request.url);

        const countryParam = searchParams.get('country') ?? undefined;
        const languageParam = searchParams.get('language') ?? undefined;
        const genderParam = searchParams.get('gender') ?? undefined;
        const countParam = searchParams.get('count') ?? '15';

        // Validate and clamp count
        let count = parseInt(countParam, 10);
        if (isNaN(count) || count < 1) count = 15;
        if (count > MAX_COUNT) count = MAX_COUNT;

        // --- Build filter object (only include fields that are not "random") ---
        const filter: Record<string, string> = {};

        if (countryParam && countryParam.toLowerCase() !== 'random') {
            if (!(COUNTRIES as readonly string[]).includes(countryParam)) {
                return NextResponse.json(
                    { error: `Invalid country: ${countryParam}. Allowed: ${COUNTRIES.join(', ')}` },
                    { status: 400 }
                );
            }
            filter.combinationCountry = countryParam;
        }

        if (languageParam && languageParam.toLowerCase() !== 'random') {
            if (!(LOCALES as readonly string[]).includes(languageParam)) {
                return NextResponse.json(
                    { error: `Invalid language: ${languageParam}. Allowed: ${LOCALES.join(', ')}` },
                    { status: 400 }
                );
            }
            filter.combinationLocale = languageParam;
        }

        if (genderParam && genderParam.toLowerCase() !== 'random') {
            const normalizedGender = genderParam.toLowerCase();
            if (!['male', 'female'].includes(normalizedGender)) {
                return NextResponse.json(
                    { error: `Gender must be "male", "female", or "random"` },
                    { status: 400 }
                );
            }
            filter.gender = normalizedGender;
        }

        // --- Build aggregation pipeline with proper typing ---
        const pipeline: mongoose.PipelineStage[] = [];

        if (Object.keys(filter).length > 0) {
            pipeline.push({ $match: filter });
        }

        pipeline.push({ $sample: { size: count } });

        // Exclude internal fields from the result
        pipeline.push({
            $project: {
                _id: 0,
                __v: 0,
                combinationCountry: 0,
                combinationLocale: 0,
            },
        });

        const profiles = await ProfileModel.aggregate<GeneratedProfile>(pipeline);

        return NextResponse.json(profiles, { status: 200 });
    } catch (error) {
        console.error('GET /api/profiles error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}