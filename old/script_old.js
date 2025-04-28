// script.js

// Entry point
document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('home-nuovo')) {
      initHome();
    } else if (document.getElementById('new-listing')) {
      initNewPage();
    } else if (document.getElementById('used-listing')) {
      initUsedPage();
    }
  });

  
  // ==========================
  // HOME PAGE
  // ==========================
  function initHome() {
    const nuovoBtn = document.getElementById('toggle-nuovo');
    const usatoBtn = document.getElementById('toggle-usato');
    const nuovoContainer = document.getElementById('home-nuovo');
    const usatoContainer = document.getElementById('home-usato');
  
    nuovoBtn.addEventListener('click', () => toggleTabs(true));
    usatoBtn.addEventListener('click', () => toggleTabs(false));
  
    function toggleTabs(showNuovo) {
      nuovoBtn.classList.toggle('bg-blue-600', showNuovo);
      nuovoBtn.classList.toggle('text-white', showNuovo);
      usatoBtn.classList.toggle('bg-blue-600', !showNuovo);
      usatoBtn.classList.toggle('text-white', !showNuovo);
  
      nuovoContainer.style.display = showNuovo ? 'grid' : 'none';
      usatoContainer.style.display = showNuovo ? 'none' : 'grid';
    }
  
    fetch('data/new_cars.csv')
      .then(r => r.text())
      .then(csv => {
        const cars = parseCSV(csv, true).slice(0, 10);
        nuovoContainer.innerHTML = renderCarCards(cars);
        return fetch('data/used_cars.csv');
      })
      .then(r => r.text())
      .then(csv => {
        const cars = parseCSV(csv, false).slice(0, 10);
        usatoContainer.innerHTML = renderCarCards(cars);
      })
      .catch(e => console.error('Errore:', e));
  }
  
  // ==========================
  // NUOVO PAGE
  // ==========================
  function initNewPage() {
    fetch('data/new_cars.csv')
      .then(r => r.text())
      .then(csv => {
        const cars = parseCSV(csv, true);
        document.getElementById('new-listing').innerHTML = cars.map(renderCarTable).join('');
      })
      .catch(e => console.error('Errore:', e));
  }
  
  // ==========================
  // USATO PAGE
  // ==========================
  function initUsedPage() {
    fetch('data/used_cars.csv')
      .then(r => r.text())
      .then(csv => {
        const cars = parseCSV(csv, false);
        document.getElementById('used-listing').innerHTML = cars.map(renderUsedCarSelector).join('');
        attachUsedCarEvents(cars);
      })
      .catch(e => console.error('Errore:', e));
  }
  
  // ==========================
  // PARSER CSV
  // ==========================
  function parseCSV(text, isNew) {
    const lines = text.trim().split(/\r?\n/);
    const headers = lines[0].split(';');
    const idx = header => headers.indexOf(header);
    const rows = lines.slice(1);
    const cars = [];
  
    for (const rowText of rows) {
      const row = rowText.split(';');
      const imageRaw = row[idx(isNew ? 'Immagine Copertina' : 'Immagine Principale')];
      console.log('Image:', imageRaw, '=>', cleanImageUrl(imageRaw, isNew));
      const image = cleanImageUrl(imageRaw, isNew);
      const brand = row[idx('Brand')];
      const model = row[idx('Modello')];
      const allestimento = row[idx('Allestimento')];
      const alimentazione = row[idx('Alimentazione')];
      const cambio = row[idx('Cambio')];
  
      const combos = [];
      const comboCount = isNew ? 8 : 40;
      const start = idx('Anticipo 1');
  
      for (let i = 0; i < comboCount; i++) {
        const a = row[start + i * 4];
        const d = row[start + i * 4 + 1];
        const k = row[start + i * 4 + 2];
        const c = row[start + i * 4 + 3];
        if (a && c && a !== '-' && c !== '-') {
          combos.push({ anticipo: a, durata: d, km: k, canone: c });
        }
      }
  
      if (combos.length === 0) continue;
  
      cars.push({
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

  // ==========================
  // CLEAN IMAGE
  // ==========================
  function cleanImageUrl(url, isNew) {
    if (!url || url === '-' || url.includes('\n')) return isNew ? 'data/no_car.png' : '';
    return url.trim().replace(/([^:]\/)\/+/g, "$1"); // rimuove doppio slash, tipo // -> /
  }
  
  // ==========================
  // RENDER HELPERS
  // ==========================
  function renderCarCards(cars) {
    return cars.map(car => {
      const best = getBestCombo(car.combos);
      return `
      <div class="car-card bg-white rounded-xl shadow p-4 hover:shadow-lg transition">
        <img src="${car.image || 'data/no_car.png'}" 
            onerror="this.src='data/no_car.png'" 
            alt="${car.brand} ${car.model}" 
            class="w-full h-48 object-cover rounded mb-2"/>
        <h4 class="font-semibold">${car.brand} ${car.model}</h4>
        <p class="text-sm text-gray-600 mb-1">${car.allestimento}</p>
        <p class="text-sm">${best.durata} mesi - ${best.km} km</p>
        <p class="text-sm">Anticipo: € ${best.anticipo.toLowerCase() === 'zero' ? '0' : best.anticipo}</p>
        <p class="text-blue-600 font-bold mt-1">€ ${best.canone} + IVA</p>
      </div>`;
    }).join('');
  }
  
  function renderCarTable(car) {
    const rows = car.combos.map(c => `
      <tr class="border-t">
        <td class="px-3 py-2">€ ${c.anticipo.toLowerCase() === 'zero' ? '0' : c.anticipo}</td>
        <td class="px-3 py-2">${c.durata} mesi</td>
        <td class="px-3 py-2">${c.km} km</td>
        <td class="px-3 py-2 font-semibold text-blue-600">€ ${c.canone} + IVA</td>
      </tr>`).join('');
  
    return `
    <div class="car-card bg-white rounded-xl shadow p-4 mb-6">
      <img src="${car.image}" class="w-full h-56 object-cover rounded mb-2" alt="${car.brand} ${car.model}"/>
      <h4 class="text-xl font-semibold">${car.brand} ${car.model}</h4>
      <p class="text-gray-600">${car.allestimento}</p>
      <table class="w-full mt-4 text-sm">
        <thead><tr class="bg-gray-100 text-left">
          <th class="px-3 py-2">Anticipo</th><th class="px-3 py-2">Durata</th><th class="px-3 py-2">Km</th><th class="px-3 py-2">Canone</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  }
  
  function renderUsedCarSelector(car, i) {
    const combo = car.combos[0];
    return `
    <div class="car-card bg-white rounded-xl shadow p-4 mb-6" id="used-${i}">
      <img src="${car.image}" class="w-full h-56 object-cover rounded mb-2" alt="${car.brand} ${car.model}"/>
      <h4 class="text-xl font-semibold">${car.brand} ${car.model}</h4>
      <p class="text-gray-600 mb-2">${car.allestimento}</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select class="selector anticipo p-2 border rounded" data-index="${i}">${renderOptions(car.combos, 'anticipo')}</select>
        <select class="selector durata p-2 border rounded" data-index="${i}">${renderOptions(car.combos, 'durata')}</select>
        <select class="selector km p-2 border rounded" data-index="${i}">${renderOptions(car.combos, 'km')}</select>
      </div>
      <p class="price mt-4 font-bold text-blue-600">Canone Mensile: € ${combo.canone} + IVA</p>
    </div>`;
  }
  
  function renderOptions(combos, key) {
    return [...new Set(combos.map(c => c[key]).filter(Boolean))]
      .map(val => `<option value="${val}">${key === 'anticipo' && val.toLowerCase() === 'zero' ? '€ 0' : val}</option>`)
      .join('');
  }
  
  function attachUsedCarEvents(cars) {
    cars.forEach((car, i) => {
      const root = document.getElementById(`used-${i}`);
      const selA = root.querySelector('.selector.anticipo');
      const selD = root.querySelector('.selector.durata');
      const selK = root.querySelector('.selector.km');
      const price = root.querySelector('.price');
  
      const updatePrice = () => {
        const combo = car.combos.find(c =>
          c.anticipo === selA.value && c.durata === selD.value && c.km === selK.value
        );
        if (combo) price.innerHTML = `Canone Mensile: € ${combo.canone} + IVA`;
      };
  
      selA.addEventListener('change', updatePrice);
      selD.addEventListener('change', updatePrice);
      selK.addEventListener('change', updatePrice);
    });
  }
  
  function getBestCombo(combos) {
    return combos.reduce((best, c) => parseFloat(c.canone) < parseFloat(best.canone) ? c : best, combos[0]);
  }