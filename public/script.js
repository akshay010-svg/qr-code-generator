const urlInput = document.getElementById("url");
const analyzeBtn = document.getElementById("analyze");
const qrImg = document.getElementById("qr-img");
const downloadBtn = document.getElementById("download");
const formatSelect = document.getElementById("format");
const colorPicker = document.getElementById("color");
const themeToggle = document.getElementById("theme-toggle");
const historyList = document.getElementById("history-list");
const metaBox = document.getElementById("meta");

// 🔹 AI-like metadata fetch
analyzeBtn.addEventListener("click", async () => {
  const url = urlInput.value.trim();
  if (!url) return;

  const res = await fetch("/api/meta", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url })
  });

  const data = await res.json();
  metaBox.textContent = `✨ ${data.title}: ${data.description}`;

  generateQR(); // auto-generate QR
});

// 🔹 QR Generation
async function generateQR() {
  const url = urlInput.value.trim();
  const format = formatSelect.value;
  const color = colorPicker.value;

  if (!url) {
    alert("Enter a URL first!");
    return;
  }

  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, format, color })
  });

  const blob = await response.blob();
  const qrUrl = URL.createObjectURL(blob);

  qrImg.src = qrUrl;
  downloadBtn.href = qrUrl;
  downloadBtn.download = `qr.${format}`;

  saveHistory(url);
}

// 🔹 Save History
function saveHistory(url) {
  let history = JSON.parse(localStorage.getItem("qrHistory")) || [];
  if (!history.includes(url)) {
    history.push(url);
    localStorage.setItem("qrHistory", JSON.stringify(history));
    renderHistory();
  }
}

function renderHistory() {
  let history = JSON.parse(localStorage.getItem("qrHistory")) || [];
  historyList.innerHTML = history.map(u => `<li>${u}</li>`).join("");
}
renderHistory();

// 🔹 Dark/Light Mode
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️ Light" : "🌙 Dark";
});

// 🔹 QR Scanner
const camera = document.getElementById("camera");
document.getElementById("scan").addEventListener("click", () => {
  camera.style.display = "block";
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => {
      camera.srcObject = stream;
      const ctx = document.createElement("canvas").getContext("2d");

      setInterval(() => {
        ctx.drawImage(camera, 0, 0, 300, 150);
        const imgData = ctx.getImageData(0, 0, 300, 150);
        const code = jsQR(imgData.data, imgData.width, imgData.height);
        if (code) {
          alert("Scanned: " + code.data);
          stream.getTracks().forEach(track => track.stop());
          camera.style.display = "none";
        }
      }, 500);
    });
});
