const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

// Assicurati esista la cartella
const uploadDir = path.join(__dirname, "/uploads/profile");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

router.post("/upload-profile", async (req, res) => {
    try {
        if (!req.files || !req.files.profileImage) {
            return res.status(400).json({ error: "Nessun file ricevuto." });
        }

        const file = req.files.profileImage;

        // Nome file basato sul timestamp
        const fileName = `profile_${Date.now()}_${file.name}`;
        const savePath = path.join(uploadDir, fileName);

        // Salva il file
        await file.mv(savePath);

        return res.json({
            message: "Upload completato!",
            fileUrl: `/uploads/profile/${fileName}`
        });

    } catch (err) {
        console.error("Errore upload:", err);
        return res.status(500).json({ error: "Errore durante l'upload." });
    }
});

module.exports = router;