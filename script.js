const stepContent = document.getElementById("stepContent");
let currentStep = 1;
let selectedProfil = null;
let inputTHG = {};
let warna = null;

// === URL Web App dari Google Apps Script ===
const API_URL = "https://script.google.com/macros/s/AKfycby6H7X9wufJSfyZCdN2ou7bUkYnbaKZmeeeGonUQjd9U1tgfi3S7hZpmh2YN0Ghc7ON/exec";

// === RENDER STEP ===
function renderStep() {
  document.querySelectorAll(".step").forEach((el, idx) => {
    el.classList.remove("active");
    if (idx + 1 === currentStep) el.classList.add("active");
  });

  if (currentStep === 1) {
    stepContent.innerHTML = `
      <div class="bg-white p-6 rounded-2xl shadow-md text-center w-full">
        <h2 class="text-lg font-semibold mb-4">Pilih Foto Profil Siswa</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          ${["Ahmad","Siti","Budi","Rina"].map(nama=>{
            const selected = selectedProfil?.nama === nama ? "bg-blue-200 border-2 border-blue-500" : "bg-blue-50";
            return `
              <div onclick="selectProfil('${nama}')" 
                class="cursor-pointer p-4 rounded-xl shadow-md ${selected} hover:bg-blue-100 transition">
                <div class="text-5xl mb-2">🎓</div>
                <p class="font-bold">${nama}</p>
              </div>
            `;
          }).join("")}
        </div>
        <button onclick="goNext()" class="bg-blue-600 text-white px-6 py-2 rounded-lg">Lanjut ke Input THG</button>
      </div>
    `;
  }

  if (currentStep === 2) {
    stepContent.innerHTML = `
      <div class="bg-white p-6 rounded-2xl shadow-md text-center w-full">
        <h2 class="text-lg font-semibold mb-4">Input Data THG</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input id="suhu" type="number" placeholder="Suhu (°C)" class="p-2 border rounded-lg">
          <input id="kelembapan" type="number" placeholder="Kelembapan (%)" class="p-2 border rounded-lg">
          <input id="gas" type="number" placeholder="Gas (ppm)" class="p-2 border rounded-lg">
        </div>
        <div class="flex justify-center space-x-4">
          <button onclick="goBackProfil()" class="bg-gray-500 text-white px-6 py-2 rounded-lg">Kembali</button>
          <button onclick="nextStepTHG()" class="bg-blue-600 text-white px-6 py-2 rounded-lg">Lanjut</button>
        </div>
      </div>
    `;
  }

  if (currentStep === 3) {
    stepContent.innerHTML = `
      <div class="bg-white p-6 rounded-2xl shadow-md text-center w-full">
        <h2 class="text-lg font-semibold mb-2">Pilih Warna Berdasarkan Sensor</h2>
        <p class="text-gray-600 mb-4">Pilih warna yang sesuai dengan LCD:</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          ${["Merah","Kuning","Hijau"].map(w=>{
            let warnaBg = w==="Merah" ? "bg-red-100 hover:bg-red-200"
                          : w==="Kuning" ? "bg-yellow-100 hover:bg-yellow-200"
                          : "bg-green-100 hover:bg-green-200";
            let bulatan = w==="Merah" ? "bg-red-500"
                          : w==="Kuning" ? "bg-yellow-500"
                          : "bg-green-500";
            return `
              <div onclick="setWarna('${w}')" 
                class="cursor-pointer p-6 rounded-xl border ${warna===w?'ring-2 ring-blue-500':''} ${warnaBg} transition">
                <div class="w-12 h-12 mx-auto rounded-full ${bulatan} mb-2"></div>
                <p class="font-semibold">${w}</p>
              </div>
            `;
          }).join("")}
        </div>
        <div class="flex justify-center space-x-4">
          <button onclick="goBackTHG()" class="bg-gray-500 text-white px-6 py-2 rounded-lg">Kembali</button>
          <button onclick="generateLaporan()" class="bg-blue-600 text-white px-6 py-2 rounded-lg">Generate Laporan</button>
        </div>
      </div>
    `;
  }

  if (currentStep === 4) {
    stepContent.innerHTML = `
      <div class="bg-white p-6 rounded-2xl shadow-md w-full">
        <h2 class="text-lg font-semibold mb-4">Laporan Monitoring</h2>

        <div class="mb-4 text-left">
          <label class="font-medium">Lihat history tanggal:</label>
          <input type="date" id="historyDate" value="${todayKey()}" class="ml-2 border p-1 rounded"
            onchange="loadHistory(this.value)">
        </div>

        <table class="w-full border text-center mb-4">
          <thead class="bg-gray-200">
            <tr>
              <th class="border p-2">Timestamp</th>
              <th class="border p-2">Nama</th>
              <th class="border p-2">Suhu</th>
              <th class="border p-2">Kelembapan</th>
              <th class="border p-2">Gas</th>
              <th class="border p-2">Warna</th>
            </tr>
          </thead>
          <tbody id="laporanBody">
            <tr><td colspan="6" class="p-4 text-gray-500">Loading data...</td></tr>
          </tbody>
        </table>

        <div class="flex justify-center">
          <button onclick="goBackProfil()" class="bg-gray-500 text-white px-6 py-2 rounded-lg">Kembali ke Profil</button>
        </div>
      </div>
    `;
    loadHistory(todayKey());
  }
}

// === STEP FUNCTION ===
function selectProfil(nama) {
  selectedProfil = {nama};
  renderStep();
}

function goNext() {
  if (!selectedProfil) {
    alert("Pilih salah satu profil dulu!");
    return;
  }
  currentStep = 2;
  renderStep();
}

function nextStepTHG() {
  const suhu = document.getElementById("suhu").value;
  const kelembapan = document.getElementById("kelembapan").value;
  const gas = document.getElementById("gas").value;

  if(!suhu || !kelembapan || !gas) {
    alert("Isi semua data!");
    return;
  }

  inputTHG = {suhu, kelembapan, gas};
  currentStep = 3;
  renderStep();
}

function setWarna(w) {
  warna = w;
  renderStep();
}

function goBackProfil() {
  currentStep = 1;
  renderStep();
}

function goBackTHG() {
  currentStep = 2;
  renderStep();
}

// === KIRIM DATA KE SERVER ===
async function generateLaporan() {
  if (!warna) {
    alert("Pilih warna sensor!");
    return;
  }

  const newData = {
    nama: selectedProfil.nama,
    suhu: inputTHG.suhu,
    kelembapan: inputTHG.kelembapan,
    gas: inputTHG.gas,
    warna: warna
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(newData),
      headers: {"Content-Type": "application/json"}
    });

    const result = await res.json();

    if (result.status === "success") {
      currentStep = 4;
      renderStep();
    } else {
      alert("Gagal menyimpan data.");
    }
  } catch (err) {
    console.error("Error:", err);
    alert("Tidak bisa terhubung ke server.");
  }
}

// === AMBIL DATA HISTORY ===
function todayKey() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

async function loadHistory(dateKey) {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    const filtered = data.filter(d => String(d.timestamp).startsWith(dateKey));
    const laporanBody = document.getElementById("laporanBody");

    laporanBody.innerHTML = filtered.length > 0 ? filtered.map(d=>`
      <tr>
        <td class="border p-2">${d.timestamp}</td>
        <td class="border p-2">${d.nama}</td>
        <td class="border p-2">${d.suhu} °C</td>
        <td class="border p-2">${d.kelembapan} %</td>
        <td class="border p-2">${d.gas} ppm</td>
        <td class="border p-2">${d.warna}</td>
      </tr>
    `).join("") : `<tr><td colspan="6" class="p-4 text-gray-500">Belum ada data</td></tr>`;
  } catch (err) {
    console.error("Error loadHistory:", err);
    document.getElementById("laporanBody").innerHTML =
      `<tr><td colspan="6" class="p-4 text-red-500">Gagal ambil data</td></tr>`;
  }
}

renderStep();
