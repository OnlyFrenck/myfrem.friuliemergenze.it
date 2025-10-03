import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { config } from 'https://cdn.jsdelivr.net/npm/dotenv@16.0.3/+esm';
config();

document.addEventListener("DOMContentLoaded", () => {
  // Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyDWjMMe_yOtuVheeCPOwKiG8_-l35qdyKY",
    authDomain: "myfrem-friuliemergenze.firebaseapp.com",
    projectId: "myfrem-friuliemergenze",
    storageBucket: "myfrem-friuliemergenze.firebasestorage.app",
    messagingSenderId: "604175974671",
    appId: "1:604175974671:web:cb02a60611513eaf377e7a"
  };
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // DOM
  const fileInput = document.getElementById("inp-upl");
  const uploadBtn = document.getElementById("btn-upl");
  const statusMsg = document.getElementById("statusMsg");

  // GitHub repo info
  const GITHUB_USER = "OnlyFrenck";
  const GITHUB_REPO = "Storage-MyFrEM";
  const GITHUB_TOKEN = process.env.GH_TOKEN;
  const GITHUB_BRANCH = "main";

  function setStatus(message, type = "info") {
    if (!statusMsg) return;
    statusMsg.textContent = message;
    statusMsg.className = type;
  }

  uploadBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      setStatus("⚠️ Devi fare login prima di caricare!", "error");
      return;
    }

    const file = fileInput?.files?.[0];
    if (!file) {
      setStatus("⚠️ Seleziona una foto prima di salvare!", "error");
      return;
    }

    setStatus("⏳ Caricamento in corso...");

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result.split(",")[1];
        const path = `uploads/${user.uid}/${Date.now()}-${file.name}`;

        // 📤 Mando evento al workflow
        const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/dispatches`, {
          method: "POST",
          headers: {
            "Accept": "application/vnd.github+json",
            "Authorization": `Bearer ${GITHUB_TOKEN}`,
          },
          body: JSON.stringify({
            event_type: "upload-file",
            client_payload: {
              path: path,
              content: base64
            }
          })
        });

        if (!res.ok) {
          throw new Error(`GitHub Dispatch fallito (${res.status})`);
        }

        const fileUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}`;

        // Salvo su Firestore
        await addDoc(collection(db, "photos"), {
          status: "pending",
          userId: user.uid,
          name: file.name,
          url: fileUrl,
          createdAt: serverTimestamp()
        });

        setStatus("✅ Foto inviata al workflow!", "success");
        fileInput.value = "";
      } catch (err) {
        console.error("❌ Errore interno:", err);
        setStatus("❌ Errore upload", "error");
      }
    };
    reader.readAsDataURL(file);
  });
});