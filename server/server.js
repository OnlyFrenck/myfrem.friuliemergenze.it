const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");

const app = express();

// ========== CORS ==========
app.use(cors({
    origin: ["http://127.0.0.1:5500", "https://myfrem.friuliemergenze.it"],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// ========== FIREBASE ADMIN ==========
admin.initializeApp({
    credential: admin.credential.cert(require("./serviceAccount.json"))
});

// ========== MULTER (TEMP) ==========
const upload = multer({ dest: "tmp/" });

// ========== API UPLOAD PROFILO ==========
app.post("/server/upload-profile", upload.single("image"), async (req, res) => {
    try {

        // 🔐 Dati da FormData
        const uid = req.body.uid;
        const token = req.body.token;

        if (!uid || !token) {
            return res.status(400).json({
                success: false,
                error: "UID o token mancante"
            });
        }

        // 🔐 Verifica token Firebase
        let decoded;
        try {
            decoded = await admin.auth().verifyIdToken(token);
        } catch {
            return res.status(403).json({
                success: false,
                error: "Token non valido"
            });
        }

        if (decoded.uid !== uid) {
            return res.status(403).json({
                success: false,
                error: "Token non valido per questo utente"
            });
        }

        // 🔥 Verifica file
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: "File non inviato"
            });
        }

        // === CARTELLA PERSONALE ===
        const userFolder = path.join(__dirname, "uploads", "profiles", uid);
        if (!fs.existsSync(userFolder)) fs.mkdirSync(userFolder, { recursive: true });

        const finalPath = path.join(userFolder, "profile.jpg");

        // 🔄 Sostituzione della foto esistente
        fs.renameSync(req.file.path, finalPath);

        const fileUrl = `https://myfrem.friuliemergenze.it/uploads/profiles/${uid}/profile.jpg`;

        res.json({
            success: true,
            url: fileUrl
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            error: "Errore interno server"
        });
    }
});


// ========== FILE STATICI ==========
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ========== START SERVER ==========
app.listen(3000, () => {
    console.log("🚀 Server avviato su PORTA 3000");
});