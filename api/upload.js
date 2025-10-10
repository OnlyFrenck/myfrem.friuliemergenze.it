export default async function handler(req, res) {
  try {
    // 🔹 Controllo metodo
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Metodo non consentito" });
    }

    // 🔹 Estrai i dati dal body
    const { path, content } = req.body || {};
    if (!path || !content) {
      return res.status(400).json({ error: "Path e content sono richiesti" });
    }

    // 🔹 Configurazione repo
    const GITHUB_USER = "OnlyFrenck";
    const GITHUB_REPO = "Storage-MyFrEM";
    const GITHUB_BRANCH = "main";
    const GITHUB_TOKEN = process.env.GH_TOKEN; // da impostare su Vercel → Settings → Environment Variables

    // 🔹 Debug log lato server (vedi in Vercel → Logs)
    console.log("DEBUG: Ricevuta richiesta upload per", path);

    // 🔹 Chiamata a GitHub API per attivare il workflow
    const ghRes = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/dispatches`, {
      method: "POST",
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_type: "upload-file",
        client_payload: { path, content },
      }),
    });

    // 🔹 Gestione errori GitHub
    if (!ghRes.ok) {
      const text = await ghRes.text();
      console.error("ERRORE GITHUB:", ghRes.status, text);
      return res.status(500).json({ error: `GitHub Dispatch fallito: ${ghRes.status} ${text}` });
    }

    // 🔹 Se tutto ok, costruisci URL file
    const fileUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}`;
    console.log("DEBUG: File inviato correttamente:", fileUrl);

    // 🔹 Risposta finale al client
    return res.status(200).json({
      message: "✅ Upload inviato correttamente al workflow",
      url: fileUrl,
    });

  } catch (err) {
    console.error("ERRORE INTERNO:", err);
    return res.status(500).json({ error: err.message || "Errore interno del server" });
  }
}