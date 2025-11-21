export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  try {
    const { path, content } = req.body;

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({ error: "Token Vercel mancante" });
    }

    const r = await fetch("https://blob.vercel-storage.com", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        pathname: path,
        content: content,
        access: "public"
      })
    });

    const data = await r.json();

    return res.status(200).json({ url: data.url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}