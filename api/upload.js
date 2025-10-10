export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  try {
    const { path, content } = req.body;
    if (!path || !content) {
      return res.status(400).json({ error: "Path e content sono richiesti" });
    }

    const GITHUB_USER = "OnlyFrenck";
    const GITHUB_REPO = "Storage-MyFrEM";
    const GITHUB_BRANCH = "main";
    const GITHUB_TOKEN = process.env.GH_TOKEN; // da configurare su Vercel

    const ghRes = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/dispatches`, {
      method: "POST",
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${GITHUB_TOKEN}`,
      },
      body: JSON.stringify({
        event_type: "upload-file",
        client_payload: { path, content }
      })
    });

    if (!ghRes.ok) {
      const text = await ghRes.text();
      throw new Error(`GitHub Dispatch fallito: ${ghRes.status} ${text}`);
    }

    const fileUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}`;
    res.status(200).json({ url: fileUrl });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}