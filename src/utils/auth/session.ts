import { prisma } from '@/utils/db'
import { CompactEncrypt, compactDecrypt } from "jose";
import crypto from 'crypto';

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 2;
const expires = new Date(Date.now() + SESSION_TTL_MS);

export async function generateSession(userId: string): Promise<{ sessionID: string; userId: string; expires: Date }> {
  return new Promise(async (resolve, reject) => {
    const sessionID = crypto.randomUUID();

    await prisma.session.create({
      data: {
        sessionID,
        userId,
        expires,
      },
    }).then((session) => {
      resolve({ sessionID: session.sessionID, userId: session.userId, expires: session.expires });
    })
      .catch((err) => {
        reject(err);
      });
  })
}

export async function generateSessionCookie(sessionId: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    if (!process.env.SECRET) {
      reject(new Error('process.env.SECRET is missing'));
    }

    const payload = JSON.stringify({
      sessionId,
      exp: expires
    })
    const secret = crypto.createHash('sha256')
      .update(process.env.SECRET as string)
      .digest();
    const jwe = await new CompactEncrypt(
      new TextEncoder()
        .encode(payload)
    )
      .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
      .encrypt(secret);
    resolve(jwe);
  })
}