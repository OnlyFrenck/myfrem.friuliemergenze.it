import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, doc, getDoc, addDoc, collection } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { firebaseConfig } from "../../configFirebase.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM
const eventsList = document.getElementById("eventsList");
const titleEvent = document.getElementById("titleEvent");
const eventIdh = document.getElementById("eventId");

// Recupero ID dall’URL
const idParam = new URLSearchParams(window.location.search);
const eventId = idParam.get("event");

// Se non c’è ID → errore
if (!eventId) {
  eventsList.innerHTML = "<p class='error'>❌ Nessun ID evento fornito nell'URL.</p>";
  throw new Error("Missing event ID");
}

async function loadPublicEvent() {
  try {
    const ref = doc(db, "events", eventId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      eventsList.innerHTML = "<p class='info'>❌ Questo ID evento non esiste nel database.</p>";
      return;
    }

    const e = snap.data();
    eventsList.innerHTML = "";

    eventIdh.textContent = `📅 ${e.title}`;
    titleEvent.textContent = `Iscriviti a ${e.title} - Registro Eventi | MyFrEM - La migliore in Friuli-Venezia Giulia nel caricamento foto inerenti l'emergenza`;

    const div = document.createElement("div");
    div.className = "event-card";
    div.innerHTML = `
      <h4><b>🆔 ID Evento:</b></h4>
      <p>${eventId}</p>

      <h4><b>📍 Luogo:</b></h4>
      <p>${e.location || "Non specificato."}</p>

      <h4><b>📅 Data e ora:</b></h4>
      <p>${e.date || "Non specificata."} ${e.time || ""}</p>  

      <h4><b>📝 Descrizione:</b></h4>
      <p>${e.description || "Non specificata."}</p>

      <h4><b>📲 Nome:</b></h4>
      <input type="text" id="textName" required />

      <h4><b>📲 Telefono:</b></h4>
      <input type="number" id="textPhone" required />

      <h4><b>📲 Email:</b></h4>
      <input type="email" id="textMail" required />

      <button id="joinBtn" class="btn">Iscriviti all'evento</button>
    `;

    eventsList.appendChild(div);

    // 🔥 ORA il bottone esiste
    const joinBtnEl = document.getElementById("joinBtn");

    joinBtnEl.addEventListener("click", async () => {
      const name = document.getElementById("textName").value.trim();
      const phone = document.getElementById("textPhone").value.trim();
      const mail = document.getElementById("textMail").value.trim();

      if (!name || !phone || !mail) {
        alert("❌ Per favore, compila tutti i campi richiesti.");
        return;
      }

      await addDoc(collection(db, "activities"), {
        type: "eventRegistration",
        nameJoiner: name,
        eventTitle: e.title,
        eventId: eventId,
        timestamp: new Date()
      })

      await addDoc(collection(db, "eventRegistrations"), {
        eventId,
        name,
        phone,
        mail,
        registeredAt: new Date()
      });

      alert(
        `✅ Iscrizione avvenuta con successo!\n\nNome: ${name}\nTelefono: ${phone}\nEmail: ${mail}`
      );

      window.location.href = "/dashboard/";
    });

  } catch (err) {
    eventsList.innerHTML = "<p class='error'>❌ Errore durante il caricamento dell'evento.</p>";
    console.error(err);
  }
}

loadPublicEvent();