import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

const initFirebaseAdmin = () => {
  const apps = getApps();

  if (!apps.length)
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Support three common formats for the private key:
        // 1) A string where newlines are escaped (\n) — common in env files
        // 2) A raw PEM string containing actual newlines
        // 3) A base64-encoded PEM string (FIREBASE_PRIVATE_KEY_BASE64)
        privateKey: (() => {
          const filePath = process.env.FIREBASE_PRIVATE_KEY_FILE;
          if (filePath) {
            try {
              const file = fs.readFileSync(filePath, "utf8");
              return file;
            } catch {
              // ignore and fall through to other env vars
            }
          }

          const raw = process.env.FIREBASE_PRIVATE_KEY;
          const b64 = process.env.FIREBASE_PRIVATE_KEY_BASE64;
          if (raw && raw.includes("\\n")) return raw.replace(/\\n/g, "\n");
          if (raw && raw.includes("BEGIN PRIVATE KEY")) return raw; // assume valid PEM
          if (b64) {
            try {
              return Buffer.from(b64, "base64").toString("utf8");
            } catch {
              // fallthrough to undefined and let cert() throw a meaningful error
            }
          }
          return raw;
        })(),
      }),
    });

  return {
    auth: getAuth(),
    db: getFirestore(),
  };
};

export const { auth, db } = initFirebaseAdmin();
