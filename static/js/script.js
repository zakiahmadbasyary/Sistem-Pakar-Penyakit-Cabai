let knowledgeBase = {};

fetch('/data/data.json')
  .then(response => response.json())
  .then(data => {
    knowledgeBase = data;
    const gejalaList = document.getElementById('gejala-list');

    for (let kode in knowledgeBase.gejala) {
      gejalaList.innerHTML += `
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="${kode}" id="${kode}">
          <label class="form-check-label" for="${kode}">
            ${knowledgeBase.gejala[kode]}
          </label>
        </div>`;
    }
  });

document.getElementById('diagnosaForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const nama = document.getElementById("nama").value;
  const selectedGejala = [];
  for (let kode in knowledgeBase.gejala) {
    if (document.getElementById(kode).checked) {
      selectedGejala.push(kode);
    }
  }

  if (selectedGejala.length === 0) {
    alert("Silakan pilih minimal satu gejala terlebih dahulu.");
    return; // berhenti di sini, tidak lanjut hitung
  }

  const hasil = [];
  let totalProb = 0;

  for (let kode in knowledgeBase.penyakit) {
    const penyakit = knowledgeBase.penyakit[kode];
    let prob = penyakit.probabilitas_awal;

    for (let g in penyakit.gejala) {
      if (selectedGejala.includes(g)) {
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
  output.innerHTML = `<h3>Hai, ${nama}! Berikut hasil diagnosis penyakit cabai :</h3>`;
  hasil.forEach(item => {
    output.innerHTML += `
      <div class="card mb-2 p-3">
        <h5>${item.nama}</h5>
        <p>Probabilitas: ${(item.probabilitas * 100).toFixed(2)}%</p>
        <a href="${item.link}" class="btn btn-danger btn-sm" target="_blank">Lihat informasi</a>
      </div>
    `;
  });
});
