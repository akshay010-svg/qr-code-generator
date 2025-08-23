import express from "express";
import bodyParser from "body-parser";
import QRCode from "qrcode";

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Home Page
app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/index.html");
});

// Handle QR generation
app.post("/generate", async (req, res) => {
  const url = req.body.url;

  if (!url) {
    return res.send("<h2>Please provide a valid URL</h2>");
  }

  try {
    const qrImage = await QRCode.toDataURL(url);
    res.send(`
      <div style="text-align:center; font-family:Arial;">
        <h2>Your QR Code</h2>
        <img src="${qrImage}" alt="QR Code"/>
        <p><a href="/">Generate Another</a></p>
      </div>
    `);
  } catch (err) {
    res.send("Error generating QR Code: " + err.message);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
