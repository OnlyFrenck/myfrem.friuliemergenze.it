export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  const { path, content } = req.body || {};

  if (!path || !content) {
    return res.status(400).json({ error: "Dati mancanti" });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ error: "Token Vercel mancante" });
  }

  try {
    const r = await fetch("https://blob.vercel-storage.com", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        pathname: path,
        content,
        access: "public"
      })
    });

    const data = await r.json();
    return res.status(200).json({ url: data.url });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}