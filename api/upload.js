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
    const busboy = (await import("busboy")).default;
    const bb = busboy({ headers: req.headers });

    let fileBuffer = null;
    let path = null;
    let filename = null;

    bb.on("field", (name, value) => {
      if (name === "path") path = value;
    });

    bb.on("file", (name, file, info) => {
      filename = info.filename;
      const chunks = [];

      file.on("data", d => chunks.push(d));
      file.on("end", () => {
        fileBuffer = Buffer.concat(chunks);
      });
    });

    bb.on("close", async () => {
      if (!fileBuffer || !path) {
        return res.status(400).json({ error: "File mancante" });
      }

      const r = await fetch("https://blob.vercel-storage.com", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
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