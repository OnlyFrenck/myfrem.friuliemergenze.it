const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

admin.initializeApp();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TO_EMAIL = "francesco@friuliemergenze.it";

exports.onPhotoUploaded = functions.firestore
  .document("photos/{photoId}")
  .onCreate(async (snap) => {

    const data = snap.data();

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "notifiche@friuliemergenze.it",
        to: TO_EMAIL,
        subject: `📸 Nuova foto caricata su MyFrEM dall'utente ${data.userId}`,
        html: `
          <h2>Nuovo upload</h2>
          <p>Utente: ${data.userId}</p>
          <p>Nome file: ${data.name}</p>
          <p><a href="${data.url}">Apri immagine</a></p>
        `
      })
    });

    return res.ok;
  });