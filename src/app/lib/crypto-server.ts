import fs from "fs";
import path from "path";
import crypto from "crypto";

const KEYS_DIR = path.join(process.cwd(), "keys");
if (!fs.existsSync(KEYS_DIR)) fs.mkdirSync(KEYS_DIR, { recursive: true });

function generateKeys({ modulusLength = 2048 } = {}) {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  const privPath = path.join(KEYS_DIR, "private.pem");
  const pubPath = path.join(KEYS_DIR, "public.pem");
  fs.writeFileSync(privPath, privateKey, { mode: 0o600 });
  fs.writeFileSync(pubPath, publicKey);
  return { privateKey, publicKey, privPath, pubPath };
}

function getPrivateKey() {
  const p = path.join(KEYS_DIR, "private.pem");
  if (!fs.existsSync(p)) throw new Error("private key not found");
  return fs.readFileSync(p, "utf8");
}

function getPublicKey() {
  const p = path.join(KEYS_DIR, "public.pem");
  if (!fs.existsSync(p)) throw new Error("public key not found");
  return fs.readFileSync(p, "utf8");
}

function signMessage({
  privateKeyPem,
  message,
}: {
  privateKeyPem: string;
  message: string;
}) {
  const signature = crypto.sign("sha256", Buffer.from(message, "utf8"), {
    key: privateKeyPem,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    saltLength: crypto.constants.RSA_PSS_SALTLEN_AUTO,
  });
  return signature;
}

function verifySignature({
  publicKeyPem,
  message,
  signatureBuffer,
}: {
  publicKeyPem: string;
  message: string;
  signatureBuffer: Buffer;
}) {
  return crypto.verify(
    "sha256",
    Buffer.from(message, "utf8"),
    {
      key: publicKeyPem,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto.constants.RSA_PSS_SALTLEN_AUTO,
    },
    signatureBuffer
  );
}

export {
  generateKeys,
  getPrivateKey,
  getPublicKey,
  signMessage,
  verifySignature,
  KEYS_DIR,
};
