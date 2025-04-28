# Drive&Joy – Sito Statico

Questo progetto ricrea un sito web moderno in italiano per **Drive&Joy**, replicando struttura e funzionalità di _driveandjoy.it_. Il sito include una homepage con offerte di noleggio **auto nuove** e **auto usate**, pagine dedicate per ciascuna categoria, recensioni clienti e informazioni di contatto reali.

## Struttura del Progetto

- **index.html** – Homepage con carosello di offerte (Nuovo/Usato), sezioni informative e recensioni.
- **nuovo.html** – Pagina con l'elenco delle offerte di noleggio per auto **nuove**.
- **usato.html** – Pagina con l'elenco delle offerte di noleggio per auto **usate**.
- **css/style.css** – Foglio di stile CSS (layout, colori, font).
- **js/script.js** – Script JavaScript per caricamento dati e interattività (carosello e menu a tendina).
- **data/new_cars.csv** – Dati delle auto nuove (esportazione Google Sheet).
- **data/used_cars.csv** – Dati delle auto usate (esportazione Google Sheet).
- **README.md** – Questo file di istruzioni.

## Istruzioni per l'Avvio

1. **Preparare i Dati**: Assicurarsi che i file CSV forniti (`new_cars.csv` e `used_cars.csv`) siano presenti nella cartella `data/`. Questi file contengono le offerte di noleggio (auto nuove e usate) estratte dal Google Sheet dell'azienda.
2. **Aprire il Sito**: Per motivi di sicurezza del browser, le funzioni di caricamento dei dati (fetch dei file CSV) potrebbero non funzionare aprendo i file HTML direttamente (`file://`). Si consiglia di utilizzare un piccolo server locale. Ad esempio, su Visual Studio Code è possibile usare l'estensione **Live Server**:
   - Aprire la cartella del progetto in VS Code.
   - Cliccare con il tasto destro su `index.html` e scegliere **"Open with Live Server"**.
3. **Navigazione**: Una volta avviato, aprire `http://127.0.0.1:5500/index.html` (o indirizzo mostrato da Live Server) nel browser:
   - **Home**: Mostra un carosello selezionabile tra **Nuovo** e **Usato** con fino a 10 offerte per ciascuno. Cliccando sui pulsanti "Nuovo" o "Usato" è possibile alternare la vista. Ogni card mostra l'auto (immagine, marca e modello, allestimento) e un esempio di offerta (durata, km, anticipo e canone mensile).
   - **Noleggio Nuovo** (`nuovo.html`): Elenco completo delle offerte per auto nuove. Ogni auto è visualizzata con dettagli e una tabella fino a 8 combinazioni di **Anticipo**, **Durata**, **Km** e **Canone** al mese. _Nota:_ Tutti i canoni sono mensili e **IVA esclusa**.
   - **Noleggio Usato** (`usato.html`): Elenco completo delle offerte per auto usate. Ogni auto offre un'interfaccia interattiva con tre menu a tendina (Anticipo, Durata, Km/anno) per selezionare fino a 40 combinazioni possibili. Il **Canone Mensile** si aggiorna in tempo reale in base alla combinazione scelta. Anche in questo caso i prezzi sono IVA esclusa.
4. **Recensioni e Contatti**: In fondo alla homepage sono riportate alcune **recensioni Google** dei clienti (estratte dal profilo Google di Drive&Joy) e i **contatti reali** dell'azienda:
   - Indirizzo Sede Legale e Operativa
   - Numero di telefono (cliccabile da smartphone)
   - Email (cliccabile per avviare un messaggio)
5. **Stile e Layout**: Il sito utilizza colori **blu** e **bianchi** in linea con l'identità Drive&Joy, un font sans-serif moderno ("Open Sans") e un layout responsive:
   - Il menu di navigazione e il piè di pagina rimangono costanti su tutte le pagine.
   - Le sezioni sono organizzate con titoli chiari e griglie di card per le offerte.
   - L'interfaccia è completamente in italiano e i prezzi sono formattati in Euro (€).
6. **Dipendenze**: Il sito è statico e non richiede alcun framework. L'unica risorsa esterna utilizzata è Google Fonts per il font "Open Sans". È richiesta una connessione internet solo per caricare il font; in alternativa, è possibile rimuovere/ sostituire il link al font nel `<head>` se si vuole usare un font di sistema senza dipendere da internet.
7. **Aggiornamento Dati**: Per aggiornare le offerte, è sufficiente sostituire i file CSV nella cartella `data/` con le nuove esportazioni da Google Sheets mantenendo lo stesso formato di colonne. Il codice JavaScript importerà automaticamente i nuovi dati al prossimo refresh della pagina.

Aprendo il sito seguendo le istruzioni, sarà possibile testare tutte le funzionalità localmente. Buon collaudo del sito **Drive&Joy**!
