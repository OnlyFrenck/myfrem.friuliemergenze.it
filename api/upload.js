import Busboy from "busboy";

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ error: "Token Vercel mancante" });
  }

  try {
    const bb = Busboy({ headers: req.headers });

    let fileBuffer = null;
    let path = null;

    bb.on("field", (name, value) => {
      if (name === "path") path = value;
    });

    bb.on("file", (name, file) => {
      const chunks = [];

      file.on("data", d => chunks.push(d));
      file.on("end", () => {
        fileBuffer = Buffer.concat(chunks);
      });
    });

    bb.on("close", async () => {
      if (!fileBuffer || !path) {
        return res.status(400).json({ error: "File o path mancante" });
      }

      const r = await fetch(`https://blob.vercel-storage.com/${path}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
          "Content-Type": "application/octet-stream"
        },
        body: fileBuffer
      });

      const data = await r.json();
      return res.status(200).json({ url: data.url });
    });

    req.pipe(bb);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}