import { randomBytes, scryptSync } from "node:crypto";
// Prints a one-time random password; never saves plaintext to the repository.
const password = randomBytes(24).toString("base64url");
const salt = randomBytes(24).toString("hex");
process.stdout.write(`ADMIN_USERNAME=owner\nADMIN_PASSWORD=${password}\n`);
process.stdout.write(`ADMIN_PASSWORD_HASH=${salt}:${scryptSync(password, salt, 64).toString("hex")}\n`);
process.stdout.write(`ADMIN_SESSION_SECRET=${randomBytes(48).toString("hex")}\n`);
