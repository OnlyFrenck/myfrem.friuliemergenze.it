import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBXD0zGs_kzfWYugVIj8rrZX91YlwBjOJU",
  authDomain: "friuli-emergenze.firebaseapp.com",
  projectId: "friuli-emergenze",
  storageBucket: "friuli-emergenze.firebasestorage.app",
  messagingSenderId: "362899702838",
  appId: "1:362899702838:web:da96f62189ef1fa2010497",
  measurementId: "G-THNJG888RE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

const fileInput = document.getElementById("inp-upl");
const uploadBtn = document.getElementById("btn-upl");
const statusMsg = document.getElementById("statusMsg");

function setStatus(msg, type="info") {
  statusMsg.textContent = msg;
  statusMsg.className = type;
}

// ✅ aspetta che Firebase sappia se l'utente è loggato
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    setStatus("✅ Utente riconosciuto", "success");
  } else {
    currentUser = null;
    setStatus("⚠️ Non sei loggato", "error");
  }
});

// ✅ upload corretto
uploadBtn.addEventListener("click", (e) => {
  e.preventDefault();

  if (!currentUser) {
    return setStatus("❌ Devi fare login", "error");
  }

  const file = fileInput.files[0];
  if (!file) {
    return setStatus("❌ Seleziona una foto", "error");
  }

  const reader = new FileReader();

  reader.onload = async () => {
    try {
      setStatus("⏳ Upload in corso...");

      const base64 = reader.result.split(",")[1];
      const filename = `${currentUser.uid}/${Date.now()}-${file.name}`;

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename,
          contentType: file.type,
          fileBase64: base64
        })
      });

      const data = await res.json();
      if (!data.url) throw new Error("Upload fallito");

      await addDoc(collection(db, "photos"), {
        status: "pending",
        userId: currentUser.uid,
        name: file.name,
        url: data.url,
        createdAt: serverTimestamp()
      });

      setStatus("✅ Foto caricata correttamente!", "success");
      fileInput.value = "";

    } catch (err) {
      console.error(err);
      setStatus("❌ Errore: " + err.message, "error");
    }
  };

  reader.readAsDataURL(file);
});