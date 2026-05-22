#!/usr/bin/env node
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/db.js';
import { env } from '../src/config/env.js';

const SCRAPE_SPORTS = ['badminton', 'football', 'cricket', 'swimming', 'table_tennis'];
const SCRAPE_AREAS = ['Gomti Nagar', 'Chinhat', 'Aliganj', 'Indira Nagar', 'Hazratganj'];

const SYSTEM_OWNER_EMAIL = 'system@playsetu.local';

async function ensureSystemOwner() {
  const existing = await prisma.user.findUnique({ where: { email: SYSTEM_OWNER_EMAIL } });
  if (existing) return existing;
  return prisma.user.create({
    data: {
      name: 'PlaySetu System',
      email: SYSTEM_OWNER_EMAIL,
      passwordHash: await bcrypt.hash(`sys-${Date.now()}`, 10),
      role: 'OWNER',
    },
  });
}

function buildPrompt(sport, area) {
  return `List up to 6 ${sport} venues in ${area}, Lucknow with current pricing. ` +
    `Return ONLY a JSON array (no markdown, no prose), matching this shape:\n` +
    `[{"name":string,"address":string,"area":string,"lat":number,"lng":number,` +
    `"pricePerHour":number,"openingTime":"HH:MM","closingTime":"HH:MM",` +
    `"skillLevels":["Beginner","Intermediate","Advanced"],"contact":string|null}]\n` +
    `Coordinates must be valid for Lucknow (~26.8 N, ~80.9 E). ` +
    `pricePerHour in INR. If unsure of a field, use a reasonable estimate.`;
}

function stripFence(text) {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
}

async function callGemini(ai, prompt) {
  const models = [env.GEMINI_MODEL, 'gemini-2.5-flash', 'gemini-2.0-flash'];
  for (const model of [...new Set(models)]) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { tools: [{ googleSearch: {} }] },
      });
      const text = stripFence(response.text || '');
      const sources = (response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [])
        .map((c) => c.web?.uri)
        .filter(Boolean);
      return { text, sources, model };
    } catch (err) {
      console.warn(`  model ${model} failed: ${err.status} ${err.message?.slice(0, 100)}`);
    }
  }
  throw new Error('All Gemini models failed');
}

async function upsertVenue(owner, sport, area, item) {
  if (!item?.name || typeof item.lat !== 'number' || typeof item.lng !== 'number') return null;

  const existing = await prisma.facility.findFirst({
    where: { name: item.name, area },
  });

  const data = {
    name: item.name,
    description: item.contact ? `Contact: ${item.contact}` : null,
    sportType: sport,
    address: item.address || area,
    area,
    latitude: item.lat,
    longitude: item.lng,
    openingTime: item.openingTime || '06:00',
    closingTime: item.closingTime || '22:00',
    skillLevels: Array.isArray(item.skillLevels) ? item.skillLevels : ['Beginner', 'Intermediate', 'Advanced'],
    status: 'ACTIVE',
  };

  if (existing) {
    return prisma.facility.update({ where: { id: existing.id }, data });
  }

  const facility = await prisma.facility.create({
    data: {
      ...data,
      ownerId: owner.id,
      courts: {
        create: [
          {
            name: `${item.name} Court 1`,
            type: sport,
            pricePerHour: item.pricePerHour > 0 ? item.pricePerHour : 500,
            status: 'ACTIVE',
          },
        ],
      },
    },
  });
  return facility;
}

async function main() {
  if (!env.GEMINI_API_KEY?.trim()) {
    console.error('GEMINI_API_KEY missing in server/.env');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const sportArg = args.find((a) => a.startsWith('--sport='))?.split('=')[1];
  const areaArg = args.find((a) => a.startsWith('--area='))?.split('=')[1];
  const sports = sportArg ? [sportArg] : SCRAPE_SPORTS;
  const areas = areaArg ? [areaArg] : SCRAPE_AREAS;

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  const owner = await ensureSystemOwner();

  let total = 0;
  let upserted = 0;

  for (const sport of sports) {
    for (const area of areas) {
      console.log(`\n→ ${sport} · ${area}`);
      try {
        const { text, sources, model } = await callGemini(ai, buildPrompt(sport, area));
        let parsed;
        try {
          parsed = JSON.parse(text);
        } catch {
          console.warn(`  failed to parse JSON (model=${model}): ${text.slice(0, 120)}…`);
          continue;
        }
        if (!Array.isArray(parsed)) {
          console.warn('  response not an array, skipping');
          continue;
        }
        console.log(`  found ${parsed.length} candidates · ${sources.length} sources`);
        for (const item of parsed) {
          total++;
          const saved = await upsertVenue(owner, sport, area, item);
          if (saved) {
            upserted++;
            console.log(`    ✓ ${saved.name}`);
          }
        }
      } catch (err) {
        console.warn(`  failed: ${err.message}`);
      }
    }
  }

  console.log(`\nDone. ${upserted}/${total} venues upserted.`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
