
document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('home-nuovo')) {
    initHome();
  }
});

let tutteLeAuto = [];

function initHome() {
  fetch('data/new_cars.csv').then(r => r.text()).then(csv1 => {
    const autoNuove = parseCSV(csv1, true);
    return fetch('data/used_cars.csv').then(r => r.text()).then(csv2 => {
      const autoUsate = parseCSV(csv2, false);

      tutteLeAuto = [...autoNuove, ...autoUsate];

      mostraAuto('nuovo'); // Mostra auto nuove all'avvio
      initCascadingFilters(tutteLeAuto);
    });
  });

  document.getElementById('btn-cerca').addEventListener('click', () => {
    const filtro = {
      brand: document.getElementById("filter-brand").value,
      model: document.getElementById("filter-model").value,
      alim: document.getElementById("filter-alim").value,
      cambio: document.getElementById("filter-cambio").value,
      maxCanone: document.getElementById("filter-canone").value
    };
    sessionStorage.setItem('filtroAuto', JSON.stringify(filtro));
    window.location.href = 'risultati.html';
  });

  document.getElementById('btn-nuovo').addEventListener('click', () => mostraAuto('nuovo'));
  document.getElementById('btn-usato').addEventListener('click', () => mostraAuto('usato'));
}

function mostraAuto(tipo) {
  ['nuovo', 'usato'].forEach(t => {
  const btn = document.getElementById(`btn-${t}`);
  if (t === tipo) {
    btn.classList.add('active', 'bg-blue-600', 'text-white');
    btn.classList.remove('bg-white', 'text-blue-600');
  } else {
    btn.classList.remove('active', 'bg-blue-600', 'text-white');
    btn.classList.add('bg-white', 'text-blue-600');
  }
});

  const autoFiltrate = tutteLeAuto
    .filter(a => a.tipo === tipo)
    .sort((a, b) => parseFloat(getBestCombo(a.combos).canone) - parseFloat(getBestCombo(b.combos).canone))
    .slice(0, 12);

  ['home-nuovo', 'home-usato'].forEach(id => {
    const el = document.getElementById(id);
    el.classList.add('opacity-0');
    setTimeout(() => {
      el.style.display = id === `home-${tipo}` ? 'grid' : 'none';
      el.innerHTML = id === `home-${tipo}` ? renderCarCards(autoFiltrate) : '';
      el.classList.remove('opacity-0');
    }, 200);
  });
}

function initFilters(data) {
  const tipoSel = document.getElementById("filter-tipologia");
  const brandSel = document.getElementById("filter-brand");
  const modelSel = document.getElementById("filter-model");
  const alimSel = document.getElementById("filter-alim");
  const cambioSel = document.getElementById("filter-cambio");

  const updateOptions = (select, values) => {
    const currentValue = select.value;
    const uniqueSorted = [...new Set(values)].sort();

    select.innerHTML = ''; // svuota il select
    const optDefault = document.createElement('option');
    optDefault.value = '';
    optDefault.textContent = 'Tutti';
    select.appendChild(optDefault);

    uniqueSorted.forEach(val => {
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = val;
      select.appendChild(opt);
    });

    // Imposta manualmente il valore selezionato SE ancora valido
    if (uniqueSorted.includes(currentValue)) {
      select.value = currentValue;
    } else {
      select.value = '';
    }
  };

  const applyCascata = () => {
    const tipo = tipoSel.value;
    const brand = brandSel.value;
    const model = modelSel.value;

    let filtered = tipo ? data.filter(c => c.tipo === tipo) : [...data];

    updateOptions(brandSel, filtered.map(c => c.brand));
    filtered = brand ? filtered.filter(c => c.brand === brand) : filtered;

    updateOptions(modelSel, filtered.map(c => c.model));
    filtered = model ? filtered.filter(c => c.model === model) : filtered;

    updateOptions(alimSel, filtered.map(c => c.alimentazione));
    updateOptions(cambioSel, filtered.map(c => c.cambio));
  };

  // Eventi su ciascun select
  tipoSel.addEventListener('change', applyCascata);
  brandSel.addEventListener('change', applyCascata);
  modelSel.addEventListener('change', applyCascata);
  alimSel.addEventListener('change', applyCascata);
  cambioSel.addEventListener('change', applyCascata);

  // Primo avvio
  applyCascata();
}

document.getElementById("btn-cerca").addEventListener("click", () => {
  const filtro = {
    tipo: document.getElementById("filter-tipologia")?.value,
    brand: document.getElementById("filter-brand")?.value,
    model: document.getElementById("filter-model")?.value,
    alim: document.getElementById("filter-alim")?.value,
    cambio: document.getElementById("filter-cambio")?.value
  };

  sessionStorage.setItem("filtroAuto", JSON.stringify(filtro));
  window.location.href = "risultati.html"; // assicurati che esista!
});


function getBestCombo(combos) {
  return combos.reduce((best, c) => parseFloat(c.canone) < parseFloat(best.canone) ? c : best, combos[0]);
}

function renderCarCards(cars) {
  return cars.map(car => {
    const best = getBestCombo(car.combos);
    const url = car.tipo === 'nuovo'
      ? `nuovo.html?brand=${encodeURIComponent(car.brand)}&model=${encodeURIComponent(car.model)}`
      : `usato.html?brand=${encodeURIComponent(car.brand)}&model=${encodeURIComponent(car.model)}`;

    return `
      <a href="${url}" class="car-card block bg-white rounded-xl shadow p-4 hover:shadow-lg transition">
        <img src="${car.image}" alt="${car.brand} ${car.model}" class="w-full h-48 object-cover rounded mb-2"/>
        <h4 class="font-semibold">${car.brand} ${car.model}</h4>
        <p class="text-sm text-gray-600 mb-1">${car.allestimento}</p>
        <p class="text-sm">${best.durata} mesi - ${best.km} km</p>
        <p class="text-sm">Anticipo: €${best.anticipo.toLowerCase() === 'zero' ? '0' : best.anticipo}</p>
        <p class="text-blue-600 font-bold mt-1">€${best.canone} + IVA</p>
      </a>`;
  }).join('');
}

// ==========================
// CLEAN IMAGE
// ==========================
function cleanImageUrl(url, isNew, row, headers) {
  const idx = h => headers.indexOf(h);

  if (url && url !== '-' && !url.includes('\n')) {
    return url.trim(); // <-- non alterare l'URL con regex
  }

  if (!isNew) {
    const otherImages = row[idx('Altre Immagini')];
    if (otherImages && otherImages !== '-') {
      const firstValid = otherImages
        .split(',')
        .map(u => u.trim())
        .find(u => u.startsWith('http'));
      if (firstValid) return firstValid; // <-- anche qui, lascia intatto
    }
  }

  return 'data/no_car.png'; // fallback
}

function parseCSV(csvText, isNew) {
  const results = Papa.parse(csvText, {
    header: true,
    delimiter: ";",
    skipEmptyLines: true
  });

  const sanitize = s => s ? s.replace(/§/g, '').replace(/[\n\r]/g, '').trim() : '';
  const cars = [];

  // Funzione per validare immagine
  function cleanImageUrl(url, isNew, row, headers) {
    const idx = h => headers.indexOf(h);

    if (url && url !== '-' && !url.includes('\n')) {
      return url.trim(); // non toccare l'URL se è valido
    }

    if (!isNew) {
      const otherImages = row[headers[idx('Altre Immagini')]];
      if (otherImages && otherImages !== '-') {
        const firstValid = otherImages
          .split(',')
          .map(u => u.trim())
          .find(u => u.startsWith('http'));
        if (firstValid) return firstValid;
      }
    }

    return 'data/no_car.png'; // fallback
  }

  for (const row of results.data) {
    const imageRaw = isNew ? row['Immagine Copertina'] : row['Immagine Principale'];
    const image = cleanImageUrl(imageRaw, isNew, row, results.meta.fields);

    const brand = row['Brand'];
    const model = row['Modello'];
    const allestimento = sanitize(row['Allestimento']);
    const alimentazione = row['Alimentazione'];
    const cambio = row['Cambio'];

    const combos = [];
    const comboCount = isNew ? 8 : 40;

    const idx = h => results.meta.fields.indexOf(h);
    const start = idx('Anticipo 1');

    if (start === -1) continue; // se non esiste "Anticipo 1", salta l’auto

    for (let i = 0; i < comboCount; i++) {
      const anticipoKey = results.meta.fields[start + i * 4];
      const durataKey = results.meta.fields[start + i * 4 + 1];
      const kmKey = results.meta.fields[start + i * 4 + 2];
      const canoneKey = results.meta.fields[start + i * 4 + 3];

      if (!anticipoKey || !canoneKey) continue;

      const a = row[anticipoKey];
      const d = row[durataKey];
      const k = row[kmKey];
      const c = row[canoneKey];

      if (a && c && a !== '-' && c !== '-') {
        combos.push({ anticipo: a, durata: d, km: k, canone: c });
      }
    }

    if (combos.length === 0) continue;

    cars.push({
      tipo: isNew ? 'nuovo' : 'usato',
      brand,
      model,
      allestimento,
      alimentazione,
      cambio,
      combos,
      image
    });
  }

  return cars;
}

