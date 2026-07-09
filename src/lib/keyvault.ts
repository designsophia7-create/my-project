import crypto from 'crypto'

// Game keys are stored AES-256-GCM encrypted. The encryption key lives only in
// the KEY_VAULT_SECRET env var (32 bytes, hex) — never in the database.
function vaultKey(): Buffer {
  const hex = process.env.KEY_VAULT_SECRET
  if (!hex || hex.length !== 64) {
    throw new Error('KEY_VAULT_SECRET must be set to 32 bytes of hex (openssl rand -hex 32)')
  }
  return Buffer.from(hex, 'hex')
}

export function encryptKey(plaintext: string): string {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', vaultKey(), iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [iv, tag, encrypted].map((b) => b.toString('base64')).join('.')
}

export function decryptKey(ciphertext: string): string {
  const [iv, tag, encrypted] = ciphertext.split('.').map((s) => Buffer.from(s, 'base64'))
  const decipher = crypto.createDecipheriv('aes-256-gcm', vaultKey(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}
