import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// ─── Firebase Config ─────────────────────────────────────────────────────────
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

// ─── Elementi DOM ─────────────────────────────────────────────────────────────
const fileInput = document.getElementById("inp-upl");
const uploadBtn = document.getElementById("btn-upl");
const statusMsg = document.getElementById("statusMsg");
const fileNameSpan = document.getElementById("file-name");

// Se non li hai nel HTML, non esplode
const progressBar = document.getElementById("progressBar") || { style:{}, value:0 };
const progressText = document.getElementById("progressText") || { textContent:"" };

let currentUser = null;

// ─── Stato Login ──────────────────────────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (!user) {
    setStatus("⚠️ Devi essere loggato per caricare");
  }
});

// ─── Mostra nome file ─────────────────────────────────────────────────────────
fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) {
    fileNameSpan.textContent = `✅ ${fileInput.files[0].name}`;
  } else {
    fileNameSpan.textContent = "Nessun file";
  }
});

// ─── Status helper ────────────────────────────────────────────────────────────
function setStatus(msg) {
  statusMsg.textContent = msg;
}

// ─── Upload ───────────────────────────────────────────────────────────────────
uploadBtn.addEventListener("click", (e) => {
  e.preventDefault();

  if (!currentUser) {
    setStatus("❌ Devi essere loggato");
    return;
  }

  const file = fileInput.files[0];
  if (!file) {
    setStatus("❌ Seleziona una foto");
    return;
  }

  const path = `uploads/${currentUser.uid}/${Date.now()}-${file.name}`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("path", path);

  setStatus("⏳ Upload in corso...");

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/upload");

  // Progress (se esiste barra)
  xhr.upload.onprogress = (event) => {
    if (event.lengthComputable && progressBar.style) {
      const percent = Math.round((event.loaded / event.total) * 100);
      progressBar.value = percent;
      progressText.textContent = percent + "%";
    }
  };

  // Risposta OK
  xhr.onload = async () => {
    try {
      const data = JSON.parse(xhr.responseText);

      if (!data.url) {
        throw new Error(data.error || "Upload fallito");
      }

      // Salva in Firestore
      await addDoc(collection(db, "photos"), {
        userId: currentUser.uid,
        name: file.name,
        url: data.url,
        createdAt: serverTimestamp()
      });

      setStatus("✅ Foto caricata correttamente!");
      if (progressText) progressText.textContent = "Completato ✅";
      fileInput.value = "";
      fileNameSpan.textContent = "Nessun file";

    } catch (err) {
      console.error(err);
      setStatus("❌ Errore: " + err.message);
    }
  };

  // Errore rete
  xhr.onerror = () => {
    setStatus("❌ Errore di rete");
  };

  xhr.send(formData);
});