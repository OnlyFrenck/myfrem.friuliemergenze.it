export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  try {
    const { path, content } = req.body;

    if (!path || !content) {
      return res.status(400).json({ error: "Dati mancanti" });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({ error: "Token Vercel mancante" });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;

    const upload = await fetch("https://blob.vercel-storage.com", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-content-name": path,
        "Content-Type": "application/octet-stream"
      },
      body: Buffer.from(content, "base64")
    });

    const text = await upload.text();

    if (!upload.ok) {
      console.error("BLOB ERRORE:", text);
      return res.status(500).json({ error: text });
    }

    const data = JSON.parse(text);

    return res.status(200).json({ url: data.url });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}