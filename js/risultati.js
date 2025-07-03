function getBestCombo(combos) {
    return combos.reduce((best, c) => parseFloat(c.canone) < parseFloat(best.canone) ? c : best, combos[0]);
  }
  
  function cleanImageUrl(url, isNew, row, headers) {
    const idx = h => headers.indexOf(h);
    if (url && url !== '-' && !url.includes('\n')) return url.trim();
    if (!isNew) {
      const other = row[headers[idx('Altre Immagini')]];
      if (other && other !== '-') {
        const first = other.split(',').map(x => x.trim()).find(x => x.startsWith('http'));
        if (first) return first;
      }
    }
    return 'data/no_car.png';
  }
  
  const queryParams = Object.fromEntries(new URLSearchParams(window.location.search).entries());
  const filtroDaStorage = sessionStorage.getItem('filtroAuto');
  const filtroIniziale = Object.keys(queryParams).length > 0
    ? queryParams
    : filtroDaStorage ? JSON.parse(filtroDaStorage) : {};
  
  let tutteLeAuto = [];
  
  fetch('http://localhost:3000/api/auto')
    .then(res => res.json())
    .then(data => {
      const autoNuove = parseSheetData(data.nuove, true);
      const autoUsate = parseSheetData(data.usate, false);
      tutteLeAuto = [...autoNuove, ...autoUsate];
  
      inizializzaFiltri(tutteLeAuto);
      applicaFiltri(tutteLeAuto);
    })
    .catch(err => {
      console.error('Errore caricamento dati:', err);
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
  
      const image = cleanImageUrl(isNew ? rowObj['Immagine Copertina'] : rowObj['Immagine Principale'], isNew, rowObj, headers);
  
      const combos = [];
      const comboCount = isNew ? 8 : 40;
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
        tipo: isNew ? 'nuovo' : 'usato',
        brand: rowObj['Brand'],
        model: rowObj['Modello'],
        allestimento: rowObj['Allestimento'] ? rowObj['Allestimento'].replace(/§|\n|\r/g, '').trim() : '',
        alimentazione: rowObj['Alimentazione'],
        cambio: rowObj['Cambio'],
        combos,
        image
      });
    });
  
    return cars;
  }
  
  function aggiornaURLConFiltri() {
    const params = new URLSearchParams();
    ['filter-tipologia', 'filter-brand', 'filter-model', 'filter-alim', 'filter-cambio'].forEach(id => {
      const val = document.getElementById(id).value;
      if (val) params.set(id.replace('filter-', ''), val);
    });
    const canone = document.getElementById('filter-canone').value;
    if (canone) params.set('maxCanone', canone);
  
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    history.replaceState(null, '', newUrl);
  }
  
  function inizializzaFiltri(auto) {
    const tipologiaSel = document.getElementById('filter-tipologia');
    const brandSel = document.getElementById('filter-brand');
    const modelSel = document.getElementById('filter-model');
    const alimSel = document.getElementById('filter-alim');
    const cambioSel = document.getElementById('filter-cambio');
    const canoneInput = document.getElementById('filter-canone');
    const canoneVal = document.getElementById('canone-val');
  
    const tuttiICanoni = auto.flatMap(a => a.combos.map(c => parseFloat(c.canone))).filter(n => !isNaN(n));
    const maxCanone = Math.max(...tuttiICanoni);
    canoneInput.max = maxCanone;
    canoneInput.value = filtroIniziale.maxCanone || maxCanone;
    canoneVal.textContent = canoneInput.value;
  
    const updateOptions = (select, values) => {
      const current = select.value;
      const unique = [...new Set(values)].sort();
      select.innerHTML = `<option value="">Tutti</option>` + unique.map(v => `<option value="${v}">${v}</option>`).join('');
      if (unique.includes(current)) select.value = current;
    };
  
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
    }
  
    // Ora puoi chiamarla!
    applyCascade();
  
    // Poi imposta i valori se disponibili
    if (filtroIniziale.tipologia) tipologiaSel.value = filtroIniziale.tipologia;
    if (filtroIniziale.brand) brandSel.value = filtroIniziale.brand;
    if (filtroIniziale.model) modelSel.value = filtroIniziale.model;
    if (filtroIniziale.alim) alimSel.value = filtroIniziale.alim;
    if (filtroIniziale.cambio) cambioSel.value = filtroIniziale.cambio;
  
    // Dopo averli settati, applica di nuovo il cascade per aggiornare i select successivi
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
      applicaFiltri(auto);
    });
  
    document.getElementById('btn-applica').addEventListener('click', () => {
      aggiornaURLConFiltri();
      applicaFiltri(auto);
    });
  
    canoneInput.addEventListener('input', e => {
      canoneVal.textContent = e.target.value;
    });
  
    applyCascade();
  }
  
  function applicaFiltri(auto) {
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
    container.innerHTML = cars.length === 0
      ? '<p class="text-center col-span-full text-gray-500">Nessun risultato trovato.</p>'
      : cars.map(car => {
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
  