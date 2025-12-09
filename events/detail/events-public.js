import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// 🔥 Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBXD0zGs_kzfWYugVIj8rrZX91YlwBjOJU",
  authDomain: "friuli-emergenze.firebaseapp.com",
  projectId: "friuli-emergenze",
  storageBucket: "friuli-emergenze.firebasestorage.app",
  messagingSenderId: "362899702838",
  appId: "1:362899702838:web:da96f62189ef1fa2010497"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM
const eventsList = document.getElementById("eventsList");
const statusMsg = document.getElementById("statusMsg");
const titleEvent = document.getElementById("titleEvent");
const eventIdh = document.getElementById("eventId");

// Recupero ID dall’URL
const idParam = new URLSearchParams(window.location.search);
const eventId = idParam.get('id');

// Se non c’è ID → errore
if (!eventId) {
    eventsList.innerHTML = "<p class='error'>❌ Nessun ID evento fornito nell'URL.</p>";
    throw new Error("Missing event ID");
}

// Carica evento specifico
async function loadPublicEvent() {
  try {
    const ref = doc(db, "events", eventId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      eventsList.innerHTML = "<p class='info'>❌ Questo ID evento non esiste nel database.</p>";
      return;
    }

    const e = snap.data();
    eventsList.innerHTML = ""; // pulizia

    // Titoli dinamici
    eventIdh.textContent = `📅 Evento: ${e.title}`;
    titleEvent.textContent = `${e.title} - Registro Eventi | MyFrEM - La migliore in Friuli-Venezia Giulia nel caricamento foto inerenti l'emergenza`;

    const div = document.createElement("div");
    div.className = "event-card";

    div.innerHTML = `
        <h3>${e.title}</h3>

        <h4><b>🆔 ID Evento:</b></h4>
        <p>${eventId}</p>

        <h4><b>📍 Luogo:</b></h4>
        <p>${e.location || "Non specificato."}</p>

        <h4><b>📝 Descrizione:</b></h4>
        <p>${e.description || "Non specificata."}</p>

        <h4><b>📲 Stato di revisione staff:</b></h4>
        <p class="status null">${e.status || "Non trovato."}</p>

        <h4><b>📅 Data creazione richiesta:</b></h4>
        <p>${e.createdAt?.toDate().toLocaleString() || "Non trovata."}</p>

        <h4><b>😁 Promulgato da:</b></h4>
        <p>${e.userId || "Friuli Emergenze"}</p>
    `;

    eventsList.appendChild(div);

  } catch (err) {
    console.error(err);
    statusMsg.textContent = "❌ Errore nel caricamento dell'evento.";
  }
}

// Avvio caricamento
loadPublicEvent();