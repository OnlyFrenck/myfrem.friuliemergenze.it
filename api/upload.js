import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }

  try {
    const { filename, contentType, fileBase64 } = req.body;

    if (!filename || !fileBase64) {
      return res.status(400).json({ error: 'Dati mancanti' });
    }

    const buffer = Buffer.from(fileBase64, 'base64');

    const blob = await put(filename, buffer, {
      access: 'public',
      contentType,
    });

    return res.status(200).json({ url: blob.url });

  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: error.message });
  }
}