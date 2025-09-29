// upload.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  // 🔥 Config Firebase
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

  // 🟢 DOM
  const fileInput = document.getElementById("inp-upl");
  const uploadBtn = document.getElementById("btn-upl");
  const statusMsg = document.getElementById("statusMsg");

  function setStatus(message, type="info") {
    if (!statusMsg) return;
    statusMsg.textContent = message;
    statusMsg.className = type;
  }

  // 🚀 Upload
  uploadBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      setStatus("⚠️ Devi fare login prima di caricare!", "error");
      return;
    }

    const file = fileInput?.files?.[0];
    if (!file) {
      setStatus("⚠️ Devi selezionare una foto prima di salvare!", "error");
      return;
    }

    try {
      setStatus("⏳ Caricamento in corso...");

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result.split(",")[1];
          const path = `uploads/${user.uid}/${Date.now()}-${file.name}`;

          // 🔗 POST a GitHub Actions workflow
          const res = await fetch(`https://api.github.com/repos/OnlyFrenck/Storage-MyFrEM/dispatches`, {
            method: "POST",
            headers: {
              "Accept": "application/vnd.github.v3+json",
              // Nessun token esposto, workflow userà secret GH_TOKEN
            },
            body: JSON.stringify({
              event_type: "upload-file",
              client_payload: {
                name: file.name,
                path: path,
                content: base64
              }
            })
          });

          if (!res.ok) throw new Error("Errore GitHub workflow");

          const fileUrl = `https://raw.githubusercontent.com/OnlyFrenck/Storage-MyFrEM/main/${path}`;

          // 🗄️ Salvataggio Firestore
          await addDoc(collection(db, "photos"), {
            status: "pending",
            userId: user.uid,
            name: file.name,
            url: fileUrl,
            createdAt: serverTimestamp()
          });

          setStatus("✅ Foto caricata con successo!", "success");
          fileInput.value = "";
        } catch (innerErr) {
          console.error("❌ Errore interno:", innerErr);
          setStatus("❌ Errore durante l'upload", "error");
        }
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error("❌ Errore principale:", err);
      setStatus("❌ Errore durante il caricamento", "error");
    }
  });

  // Logout
  document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    await auth.signOut();
    window.location.href = "/login/";
  });

});