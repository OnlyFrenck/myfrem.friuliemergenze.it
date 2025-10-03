import fetch from "node-fetch";

export async function handler(event) {
  try {
    const { path, content } = JSON.parse(event.body);

    if (!path || !content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Path e content sono richiesti" }),
      };
    }

    const GITHUB_USER = "OnlyFrenck";
    const GITHUB_REPO = "Storage-MyFrEM";
    const GITHUB_BRANCH = "main";
    const GITHUB_TOKEN = process.env.GH_TOKEN; // impostalo in Netlify ENV

    const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/dispatches`, {
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

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GitHub Dispatch fallito: ${res.status} ${text}`);
    }

    const fileUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}`;

    return { statusCode: 200, body: JSON.stringify({ message: "Upload inviato al workflow", url: fileUrl }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}