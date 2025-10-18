import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import { getPublicKey, verifySignature } from "@/app/lib/crypto-server";
import { parseForm } from "../_formidable/route";

// تعطيل body parsing الافتراضي
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const { fields, files } = await parseForm(req as any);

    let message = "";

    if (fields && fields.message) {
      message = String(fields.message);
    } else if (files && files.file) {
      // التعامل مع ملفات واحدة أو متعددة
      const fileObj = Array.isArray(files.file) ? files.file[0] : files.file;

      // @ts-ignore لتجاوز تحذير TypeScript لأن filepath مش موجودة في type
      const filepath = fileObj.filepath || fileObj.path;
      if (!filepath)
        return NextResponse.json(
          { error: "file path missing" },
          { status: 400 }
        );

      const buf = fs.readFileSync(filepath);
      message = buf.toString("utf8");
    } else {
      return NextResponse.json(
        { error: "no message or file" },
        { status: 400 }
      );
    }

    if (!fields || !fields.signature) {
      return NextResponse.json(
        { error: "no signature provided" },
        { status: 400 }
      );
    }

    const signatureBase64 = String(fields.signature);
    const signatureBuf = Buffer.from(signatureBase64, "base64");

    const publicKey = getPublicKey();
    const ok = verifySignature({
      publicKeyPem: publicKey,
      message,
      signatureBuffer: signatureBuf,
    });

    return NextResponse.json({ valid: ok }, { status: 200 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
