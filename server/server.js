const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// CORS — permetti le richieste dal tuo frontend locale + dominio reale
app.use(cors({
    origin: [
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "https://myfrem.friuliemergenze.it"
    ],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Per leggere form-data (il file NON passa in JSON!)
const fileUpload = require("express-fileupload");
app.use(fileUpload());

// Rotta separata upload-profile
const uploadProfileRoute = require("./upload-profile");
app.use("/server", uploadProfileRoute);

// Avvio server
app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});