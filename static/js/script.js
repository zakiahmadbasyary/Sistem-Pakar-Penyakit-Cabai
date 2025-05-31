let knowledgeBase = {};
let currentGejalaIndex = 0;
let selectedGejala = [];
let gejalaKeys = [];

fetch('/data/data.json')
  .then(response => response.json())
  .then(data => {
    knowledgeBase = data;
    gejalaKeys = Object.keys(knowledgeBase.gejala);
    tampilkanPertanyaan();
  });

function tampilkanPertanyaan() {
  const gejalaContainer = document.getElementById('gejala-list');
  gejalaContainer.innerHTML = '';

  if (currentGejalaIndex < gejalaKeys.length) {
    const kode = gejalaKeys[currentGejalaIndex];
    const dataGejala = knowledgeBase.gejala[kode];

    const prevJawaban = selectedGejala.includes(kode) ? true : false;
    const prevTidak = !prevJawaban && selectedGejala.includes("!" + kode);

    gejalaContainer.innerHTML = `
      <div class="card p-3 text-center">
        <img src="${dataGejala.gambar}" alt="Gambar Gejala" class="img-fluid mb-3 rounded" style="max-height: 500px;">
        <h5 class="mb-2">${dataGejala.teks}</h5>
        <p class="text-muted">${dataGejala.keterangan}</p>
        <div class="d-flex justify-content-center gap-4" style="font-size: 1.1rem;">
          <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-right: 8px;">
            <input type="checkbox" id="jawab-ya" ${prevJawaban ? 'checked' : ''} onclick="toggleCheckbox(this, 'ya')" style="width: 18px; height: 18px;">
            Ya
          </label>
          <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
            <input type="checkbox" id="jawab-tidak" ${prevTidak ? 'checked' : ''} onclick="toggleCheckbox(this, 'tidak')" style="width: 18px; height: 18px;">
            Tidak
          </label>
        </div>
      </div>
      <div class="mt-3 d-flex justify-content-between">
        <button class="btn btn-secondary" onclick="prevQuestion()" ${currentGejalaIndex === 0 ? 'disabled' : ''}>Kembali</button>
        <button class="btn btn-primary" onclick="nextQuestion()">Next</button>
      </div>
    `;
  } else {
    prosesDiagnosa();
  }
}

function toggleCheckbox(clickedCheckbox, tipe) {
  const yaCheckbox = document.getElementById('jawab-ya');
  const tidakCheckbox = document.getElementById('jawab-tidak');

  if (tipe === 'ya' && clickedCheckbox.checked) {
    tidakCheckbox.checked = false;
  } else if (tipe === 'tidak' && clickedCheckbox.checked) {
    yaCheckbox.checked = false;
  }
}

function nextQuestion() {
  const yaCheckbox = document.getElementById('jawab-ya');
  const tidakCheckbox = document.getElementById('jawab-tidak');

  if (!yaCheckbox.checked && !tidakCheckbox.checked) {
    alert('Silakan pilih jawaban Ya atau Tidak sebelum melanjutkan.');
    return;
  }

  const kode = gejalaKeys[currentGejalaIndex];
  selectedGejala = selectedGejala.filter(g => g !== kode && g !== ("!" + kode));

  if (yaCheckbox.checked) {
    selectedGejala.push(kode);
  } else if (tidakCheckbox.checked) {
    selectedGejala.push("!" + kode);
  }

  currentGejalaIndex++;
  tampilkanPertanyaan();
}

function prevQuestion() {
  if (currentGejalaIndex > 0) {
    currentGejalaIndex--;
    tampilkanPertanyaan();
  }
}

function prosesDiagnosa() {
  const nama = document.getElementById("nama").value.trim();
  if (!nama) {
    alert("Silakan masukkan nama terlebih dahulu.");
    currentGejalaIndex = 0;
    selectedGejala = [];
    tampilkanPertanyaan();
    return;
  }

  const gejalaDipilih = selectedGejala.filter(g => !g.startsWith('!'));

  const hasil = [];
  let totalProb = 0;

  for (let kode in knowledgeBase.penyakit) {
    const penyakit = knowledgeBase.penyakit[kode];
    let prob = penyakit.probabilitas_awal;

    for (let g in penyakit.gejala) {
      if (gejalaDipilih.includes(g)) {
        prob *= penyakit.gejala[g];
      }
    }

    hasil.push({
      kode: kode,
      nama: penyakit.nama,
      probabilitas: prob,
      link: penyakit.link
    });

    totalProb += prob;
  }

  hasil.forEach(item => {
    item.probabilitas = totalProb > 0 ? item.probabilitas / totalProb : 0;
  });

  hasil.sort((a, b) => b.probabilitas - a.probabilitas);

  const output = document.getElementById("hasil");
  output.innerHTML = `
    <h3>Hai, ${nama}!</h3>
    <h5>Gejala yang kamu pilih:</h5>
    <ul  style="padding-left: 20px; margin-top: 10px;">
      ${gejalaDipilih.map(kode => `<li>${knowledgeBase.gejala[kode].teks}</li>`).join('')}
    </ul>
    <h4>Hasil Diagnosis:</h4>
  `;

  hasil.forEach(item => {
    output.innerHTML += `
      <div class="card mb-2 p-3">
        <h5>${item.nama}</h5>
        <p>Probabilitas: ${(item.probabilitas * 100).toFixed(2)}%</p>
        <a href="${item.link}" class="btn btn-danger btn-sm" target="_blank">Lihat informasi</a>
      </div>
    `;
  });

  document.getElementById("diagnosaForm").style.display = "none";
}
