"use client";
import { FormEvent, useEffect, useState } from "react";

export default function Home() {
  const [privateKey, setPrivateKey] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [verifyResult, setVerifyResult] = useState<Boolean | null>(null);
  const [log, setLog] = useState("");

  const [encodedMessage, setEncodedMessage] = useState("");
  const [senderData, setSenderData] = useState("");
  const [receiverData, setReceiverData] = useState("");

  async function genKeys() {
    const r = await fetch("/api/genkeys");
    const j = await r.json();
    if (j.privateKey && j.publicKey) {
      setPrivateKey(j.privateKey);
      setPublicKey(j.publicKey);
      setLog("Keys generated");
    } else {
      setLog(JSON.stringify(j));
    }
  }

  async function sign(e: FormEvent) {
    e.preventDefault();
    const form = new FormData();
    form.append("message", message);
    setEncodedMessage(btoa(message)); // تحويل الرسالة لـ Base64
    setSenderData(message); // البيانات عند المرسل
    const r = await fetch("/api/sign", { method: "POST", body: form });
    const j = await r.json();
    if (j.signature) setSignature(j.signature);
    else setLog(JSON.stringify(j));
  }

  async function verify(e: FormEvent) {
    e.preventDefault();
    const form = new FormData();
    form.append("message", message);
    form.append("signature", signature);
    setReceiverData(message); // البيانات عند المستلم
    const r = await fetch("/api/verify", { method: "POST", body: form });
    const j = await r.json();
    if (typeof j.valid !== "undefined") setVerifyResult(Boolean(j.valid));
    else setLog(JSON.stringify(j));
  }

  return (
    <main className="w-full py-8 mx-auto font-sans bg-blue-50 px-4">
      <h1 className="text-5xl font-bold text-center mb-8 bg-gradient-to-r from-blue-500 via-green-400 to-purple-500 bg-clip-text text-transparent animate-gradient leading-normal">
        Digital Signature
      </h1>

      {/* المفاتيح */}
      <section className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-3xl font-semibold mb-4 text-blue-800">Keys</h2>
        <div className="flex gap-4">
          <div className="flex-1">
            <h3 className="font-medium">Private Key</h3>
            <textarea
              className="w-full min-h-40 p-2 border rounded text-xs font-mono"
              readOnly
              value={privateKey}
            />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">Public Key</h3>
            <textarea
              className="w-full min-h-40 p-2 border rounded text-xs font-mono"
              readOnly
              value={publicKey}
            />
          </div>
        </div>
          <button
            onClick={genKeys}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Generate Keys
          </button>
      </section>

      {/* التوقيع */}
      <section className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold mb-4">Sign Message</h2>
        <form onSubmit={sign} className="flex flex-col gap-3 mb-4">
          <label>Original Message:</label>
          <textarea
            className="w-full p-2 border rounded"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Sign
          </button>
        </form>

        {signature && (
          <>
            <div className="mb-2">
              <label>Signature (Base64):</label>
              <textarea
                className="w-full p-2 border rounded font-mono"
                rows={4}
                readOnly
                value={signature}
              />
            </div>
            <div className="mb-2">
              <label>Message encoded (Base64):</label>
              <textarea
                className="w-full p-2 border rounded font-mono"
                rows={2}
                readOnly
                value={encodedMessage}
              />
            </div>
          </>
        )}
      </section>

      {/* التحقق */}
      <section className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold mb-4">Verify Signature</h2>
        <form onSubmit={verify} className="flex flex-col gap-3 mb-4">
          <label>Message to Verify:</label>
          <textarea
            className="w-full p-2 border rounded"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <label>Signature (Base64):</label>
          <textarea
            className="w-full p-2 border rounded font-mono"
            rows={4}
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Verify
          </button>
        </form>

        {verifyResult !== null && (
          <div
            className={`font-bold ${
              verifyResult ? "text-green-600" : "text-red-600"
            }`}
          >
            Result: {verifyResult ? "✅ Valid" : "❌ Invalid"}
          </div>
        )}
      </section>

      {/* البيانات عند المرسل والمستلم */}
      <section className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold mb-4">Debug Info</h2>
        <div className="grid gap-3">
          <div>
            <label>Sender Data (Original Message):</label>
            <textarea
              className="w-full p-2 border rounded font-mono"
              rows={2}
              readOnly
              value={senderData}
            />
          </div>
          <div>
            <label>Receiver Data (Received Message):</label>
            <textarea
              className="w-full p-2 border rounded font-mono"
              rows={2}
              readOnly
              value={receiverData}
            />
          </div>
          <div>
            <label>Log / API Response:</label>
            <pre className="p-2 border rounded font-mono bg-gray-50">{log}</pre>
          </div>
        </div>
      </section>

      <p className="text-center text-gray-500">
        Note: Simple demo for educational purposes.
      </p>
    </main>
  );
}
