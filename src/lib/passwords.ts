import "server-only";
import { randomBytes } from "crypto";

// No look-alike characters (0/O, 1/l/I), so a password can be read aloud or
// written on paper without ambiguity.
const ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generatePassword(length = 12) {
  const bytes = randomBytes(length);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}
