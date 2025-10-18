import formidable from "formidable";
import { NextRequest } from "next/server";

export function parseForm(req: NextRequest) {
  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>(
    (resolve, reject) => {
      const form = new formidable.IncomingForm();
      form.parse(req as any, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    }
  );
}
