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

  // DOM
  const fileInput = document.getElementById("inp-upl");
  const uploadBtn = document.getElementById("btn-upl");
  const statusMsg = document.getElementById("statusMsg");

  function setStatus(message, type = "info") {
    if (!statusMsg) return;
    statusMsg.textContent = message;
    statusMsg.className = type; // CSS: .info .success .error
  }

  uploadBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) return setStatus("⚠️ Devi fare login!", "error");

    const file = fileInput?.files?.[0];
    if (!file) return setStatus("⚠️ Seleziona una foto prima di salvare!", "error");

    setStatus("⏳ Caricamento in corso...");

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result.split(",")[1];
        const path = `uploads/${user.uid}/${Date.now()}-${file.name}`;

        // 🔗 Chiamata alla Netlify Function
        const res = await fetch("/.netlify/functions/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path, content: base64 })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Errore workflow");

        const fileUrl = `https://raw.githubusercontent.com/OnlyFrenck/Storage-MyFrEM/main/${path}`;

        // Salva Firestore
        await addDoc(collection(db, "photos"), {
          status: "pending",
          userId: user.uid,
          name: file.name,
          url: fileUrl,
          createdAt: serverTimestamp()
        });

        setStatus("✅ Foto caricata con successo!", "success");
        fileInput.value = "";
      } catch (err) {
        console.error("❌ Errore upload:", err);
        setStatus("❌ Errore durante l'upload", "error");
      }
    };
    reader.readAsDataURL(file);
  });
});