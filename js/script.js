function getBestCombo(combos) {
  return combos.reduce((best, c) => parseFloat(c.canone) < parseFloat(best.canone) ? c : best, combos[0]);
}



function cleanImageUrl(url, isNew, row) {
  if (url && url !== '-' && url.trim() !== '') {
    return url.trim();
  }
  if (!isNew) {
    // fallback: usa Immagine Principale se esiste, altrimenti Immagine Copertina
    const mainImg = row['Immagine Principale'] || row['Immagine Copertina'];
    if (mainImg && mainImg !== '-' && mainImg.trim() !== '') {
      return mainImg.trim();
    }
  }
  return 'data/no_car.png';
}


let tutteLeAuto = [];
let autoVisibili = [];

document.addEventListener('DOMContentLoaded', () => {
  fetch('http://localhost:3000/api/auto')
    .then(res => res.json())
    .then(data => {
      const autoNuove = parseSheetData(data.nuove, true);
      const autoUsate = parseSheetData(data.usate, false);
      tutteLeAuto = [...autoNuove, ...autoUsate];

      initFilters(tutteLeAuto);
      mostraAuto('nuovo');

      // Pulsanti Nuovo e Usato
      document.getElementById('btn-nuovo').addEventListener('click', () => mostraAuto('nuovo'));
      document.getElementById('btn-usato').addEventListener('click', () => mostraAuto('usato'));

      // Pulsante cerca/applica: salva filtro e reindirizza
      document.getElementById('btn-applica').addEventListener('click', () => {
        const filtro = {
          tipologia: document.getElementById('filter-tipologia').value,
          brand: document.getElementById('filter-brand').value,
          model: document.getElementById('filter-model').value,
          alim: document.getElementById('filter-alim').value,
          cambio: document.getElementById('filter-cambio').value,
          maxCanone: document.getElementById('filter-canone').value
        };
        sessionStorage.setItem('filtroAuto', JSON.stringify(filtro));
        window.location.href = 'risultati.html';
      });
      
    })
    .catch(err => console.error('Errore caricamento dati:', err));
});

function parseSheetData(sheetData, isNew) {
  const headers = sheetData[0];
  const rows = sheetData.slice(1);
  const cars = [];

  rows.forEach(row => {
    const rowObj = {};
    headers.forEach((header, i) => {
      rowObj[header] = row[i];
    });

    let tipoAuto = isNew ? 'nuovo' : 'usato';

    // Se usato ma "Da Ordine" è "si", trattalo come nuovo
    if (!isNew && rowObj['Da Ordine'] && rowObj['Da Ordine'].toLowerCase() === 'si') {
      tipoAuto = 'nuovo';
    }

    let image = '';
    if (tipoAuto === 'nuovo') {
      image = rowObj['Immagine Principale'] || rowObj['Immagine Copertina'] || '';
    } else {
      image = rowObj['Immagine Principale'] || rowObj['Immagine Copertina'] || '';
    }
    image = cleanImageUrl(image, tipoAuto === 'nuovo', rowObj);

    const combos = [];
    const comboCount = tipoAuto === 'nuovo' ? 8 : 40;
    const start = headers.indexOf('Anticipo 1');
    if (start === -1) return;

    for (let i = 0; i < comboCount; i++) {
      const a = rowObj[headers[start + i * 4]];
      const d = rowObj[headers[start + i * 4 + 1]];
      const k = rowObj[headers[start + i * 4 + 2]];
      const c = rowObj[headers[start + i * 4 + 3]];
      if (a && c && a !== '-' && c !== '-') {
        combos.push({ anticipo: a, durata: d, km: k, canone: c });
      }
    }

    if (combos.length === 0) return;

    cars.push({
      tipo: tipoAuto,
      brand: rowObj['Brand'],
      model: rowObj['Modello'],
      allestimento: rowObj['Allestimento'] ? rowObj['Allestimento'].replace(/§|\n|\r/g, '').trim() : '',
      alimentazione: rowObj['Alimentazione'],
      cambio: rowObj['Cambio'],
      combos,
      image,
      daOrdine: rowObj['Da Ordine'] ? rowObj['Da Ordine'].toLowerCase() : 'no' // salvati questa info per filtro home
    });
  });

  return cars;
}

function initFilters(auto) {
  const tipologiaSel = document.getElementById('filter-tipologia');
  const brandSel = document.getElementById('filter-brand');
  const modelSel = document.getElementById('filter-model');
  const alimSel = document.getElementById('filter-alim');
  const cambioSel = document.getElementById('filter-cambio');
  const canoneInput = document.getElementById('filter-canone');
  const canoneVal = document.getElementById('canone-val');

  // Prendi tutti i canoni validi e trova massimo e minimo
  const tuttiICanoni = auto.flatMap(a => a.combos.map(c => parseFloat(c.canone))).filter(n => !isNaN(n));
  const maxCanone = Math.max(...tuttiICanoni);
  const minCanone = Math.min(...tuttiICanoni);

  // Imposta il range del filtro canone
  canoneInput.min = minCanone;
  canoneInput.max = maxCanone;
  // Inizializza valore e testo con massimo come default
  canoneInput.value = maxCanone;
  canoneVal.textContent = maxCanone;

  // Funzione per aggiornare le opzioni di un select, mantenendo il valore corrente se ancora valido
  const updateOptions = (select, values) => {
    const current = select.value;
    const unique = [...new Set(values)].sort();
    select.innerHTML = `<option value="">Tutti</option>` + unique.map(v => `<option value="${v}">${v}</option>`).join('');
    if (unique.includes(current)) select.value = current;
  };

// Funzione per applicare i filtri a cascata (progressivi) sui select
function applyCascade() {
  const tipo = tipologiaSel.value;
  const brand = brandSel.value;
  const model = modelSel.value;

  let filtered = tipo ? tutteLeAuto.filter(a => a.tipo === tipo) : [...tutteLeAuto];
  updateOptions(brandSel, filtered.map(a => a.brand));

  filtered = brand ? filtered.filter(a => a.brand === brand) : filtered;
  updateOptions(modelSel, filtered.map(a => a.model));

  filtered = model ? filtered.filter(a => a.model === model) : filtered;
  updateOptions(alimSel, filtered.map(a => a.alimentazione));
  updateOptions(cambioSel, filtered.map(a => a.cambio));

  updateCanoneRange(filtered);
}
  

  // Applica cascata al caricamento
  applyCascade();

  // Event listeners per aggiornare i filtri a cascata
  tipologiaSel.addEventListener('change', () => {
    brandSel.value = '';
    modelSel.value = '';
    alimSel.value = '';
    cambioSel.value = '';
    applyCascade();
  });

  brandSel.addEventListener('change', applyCascade);
  modelSel.addEventListener('change', applyCascade);
  alimSel.addEventListener('change', applyCascade);
  cambioSel.addEventListener('change', applyCascade);

  // Reset filtri
  document.getElementById('btn-reset').addEventListener('click', () => {
    [tipologiaSel, brandSel, modelSel, alimSel, cambioSel].forEach(s => s.value = '');
    applyCascade(); // Ricalcola tutto
    canoneInput.value = canoneInput.max; // resetta valore al massimo
    canoneVal.textContent = canoneInput.value;
  });

  // Applica filtri
  document.getElementById('btn-applica').addEventListener('click', () => {
    applyFilters(auto);
  });

  // Aggiorna valore display canone durante il cambio slider
  canoneInput.addEventListener('input', e => {
    canoneVal.textContent = e.target.value;
  });
}

function updateCanoneRange(filteredAutos) {
  const canoneInput = document.getElementById('filter-canone');
  const canoneVal = document.getElementById('canone-val');
  const canoneMin = document.getElementById('canone-min');

  const tuttiICanoni = filteredAutos.flatMap(a => a.combos.map(c => parseFloat(c.canone))).filter(n => !isNaN(n));
  if (tuttiICanoni.length === 0) return;

  const maxCanone = Math.max(...tuttiICanoni);
  const minCanone = Math.min(...tuttiICanoni);

  canoneInput.min = minCanone;
  canoneInput.max = maxCanone;

  // Se valore corrente è > max, aggiorna a max
  if (parseFloat(canoneInput.value) > maxCanone) {
    canoneInput.value = maxCanone;
  }

  canoneVal.textContent = canoneInput.value;
  canoneMin.textContent = minCanone;
}

function applyCascade() {
  const tipo = tipologiaSel.value;
  const brand = brandSel.value;
  const model = modelSel.value;

  let filtered = tipo ? auto.filter(a => a.tipo === tipo) : [...auto];
  updateOptions(brandSel, filtered.map(a => a.brand));

  filtered = brand ? filtered.filter(a => a.brand === brand) : filtered;
  updateOptions(modelSel, filtered.map(a => a.model));

  filtered = model ? filtered.filter(a => a.model === model) : filtered;
  updateOptions(alimSel, filtered.map(a => a.alimentazione));
  updateOptions(cambioSel, filtered.map(a => a.cambio));

  // Aggiorna range canone in base ai dati filtrati
  updateCanoneRange(filtered);
}


applyCascade();

tipologiaSel.addEventListener('change', () => {
  brandSel.value = '';
  modelSel.value = '';
  alimSel.value = '';
  cambioSel.value = '';
  applyCascade();
});

brandSel.addEventListener('change', applyCascade);
modelSel.addEventListener('change', applyCascade);

document.getElementById('btn-reset').addEventListener('click', () => {
  [tipologiaSel, brandSel, modelSel, alimSel, cambioSel].forEach(s => s.value = '');
  canoneInput.value = maxCanone;
  canoneVal.textContent = maxCanone;
  applyCascade();
});

document.getElementById('btn-applica').addEventListener('click', () => {
  applyFilters(auto);
});

canoneInput.addEventListener('input', e => {
  canoneVal.textContent = e.target.value;
});

function mostraAuto(tipo) {
  if (tipo === 'usato') {
    // Escludi auto usate con daOrdine = 'si'
    autoVisibili = tutteLeAuto.filter(a => a.tipo === 'usato' && a.daOrdine !== 'si');
  } else {
    // Mostra auto nuove o quelle con tipo = 'nuovo' (incluso usate da ordine trattate come nuove)
    autoVisibili = tutteLeAuto.filter(a => a.tipo === tipo);
  }
  renderRisultati(autoVisibili);

  ['btn-nuovo', 'btn-usato'].forEach(id => {
    const btn = document.getElementById(id);
    btn.classList.toggle('active', id === `btn-${tipo}`);
  });
}

function applyFilters(auto) {
  const brand = document.getElementById('filter-brand').value;
  const model = document.getElementById('filter-model').value;
  const alim = document.getElementById('filter-alim').value;
  const cambio = document.getElementById('filter-cambio').value;
  const tipologia = document.getElementById('filter-tipologia').value;
  const maxCanone = parseFloat(document.getElementById('filter-canone').value);

  const filtrate = auto.filter(a => {
    const best = getBestCombo(a.combos);
    return (!brand || a.brand === brand)
      && (!model || a.model === model)
      && (!alim || a.alimentazione === alim)
      && (!cambio || a.cambio === cambio)
      && (!tipologia || a.tipo === tipologia)
      && parseFloat(best.canone) <= maxCanone;
  });

  renderRisultati(filtrate);
}


function renderRisultati(cars) {
  const container = document.getElementById('results-list');
  if (!container) {
    console.warn('Div #results-list non trovato nel DOM');
    return;
  }
  container.innerHTML = cars.length === 0
    ? '<p class="text-center col-span-full text-gray-500">Nessun risultato trovato.</p>'
    : cars.map(car => {
      //console.log('Immagine auto:', car.image); // <--- qui logga l'url immagine
      const best = getBestCombo(car.combos);
      const url = car.tipo === 'nuovo'
        ? `nuovo.html?brand=${encodeURIComponent(car.brand)}&model=${encodeURIComponent(car.model)}`
        : `usato.html?brand=${encodeURIComponent(car.brand)}&model=${encodeURIComponent(car.model)}`;
        return `
          <a href="${url}" class="car-card block bg-white rounded-xl shadow border-2 border-[#00AEEF] p-4 transition-transform hover:-translate-y-1 hover:shadow-lg">
            <img src="${car.image}" alt="${car.brand} ${car.model}" class="w-full h-48 object-cover rounded mb-2"/>
            <h4 class="font-semibold">${car.brand} ${car.model}</h4>
            <p class="text-sm text-gray-600 mb-1">${car.allestimento}</p>
            <p class="text-sm">${best.durata} mesi - ${best.km} km</p>
            <p class="text-sm">Anticipo: €${best.anticipo.toLowerCase() === 'zero' ? '0' : best.anticipo}</p>
            <p class="text-blue-600 font-bold mt-1">€${best.canone} + IVA</p>
          </a>`;


    }).join('');
}
