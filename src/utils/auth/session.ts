import { prisma } from '@/utils/db'
import { CompactEncrypt, compactDecrypt } from "jose";
import crypto from 'crypto';

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 2;
const expires = new Date(Date.now() + SESSION_TTL_MS);

export async function generateSession(userId: string): Promise<{ sessionID: string; userId: string; expires: Date }> {
  return new Promise(async (resolve, _reject) => {
    const sessionID = crypto.randomUUID();
    await prisma.session.create({
      data: {
        sessionID,
        userId,
        expires,
      }
    });

    resolve({ sessionID, userId, expires });
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

export async function decryptSessionCookie(sessionCookie: string): Promise<{ sessionId: string; exp: string }> {
  return new Promise(async (resolve, reject) => {
    if (!process.env.SECRET) {
      reject(new Error('process.env.SECRET is missing'));
    }

    const secret = crypto.createHash('sha256')
      .update(process.env.SECRET as string)
      .digest();

    const { plaintext } = await compactDecrypt(sessionCookie, secret);
    const decoded = new TextDecoder().decode(plaintext);
    const sessionData = JSON.parse(decoded);
    resolve(sessionData);
  })
}
export async function sessionToUser(sessionCookie: string) {
  const sessionData = await decryptSessionCookie(sessionCookie);
  const session = await prisma.session.findUnique({
    where: { sessionID: sessionData.sessionId },
    include: { user: true }
  });
  if (!session || session.expires < new Date()) {
    return null;
  }
  return session.user;
}