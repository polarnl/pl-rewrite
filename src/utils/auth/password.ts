import argon2 from 'argon2';

export function hashPassword(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    argon2.hash(password + process.env.PEPPER, {
      salt: Buffer.from(salt)
    })
      .then((hash) => {
        resolve(hash)
      })
      .catch((err) => {
        reject(err)
      })
  })
}