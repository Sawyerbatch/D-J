import streamlit as st
import pandas as pd
import os

st.set_page_config(page_title="Drive&Joy", layout="wide")

# 🌐 CSS estetico
st.markdown("""
    <style>
    .card {
        background-color: #1f2937;
        padding: 1rem;
        border-radius: 12px;
        margin-bottom: 2rem;
        box-shadow: 0 2px 5px rgba(0,0,0,0.15);
    }
    .card h3 {
        color: white;
        margin-bottom: 0.2rem;
    }
    .card p {
        margin: 0.2rem 0;
        color: #d1d5db;
    }
    .gallery {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 1.5rem;
        margin-top: 2rem;
    }
    </style>
""", unsafe_allow_html=True)

# 🚗 HEADER HOMEPAGE
st.markdown("""
    <div style="background-color:#111827;padding:2rem 2rem;border-radius:12px">
        <h1 style="color:white;margin-bottom:0.5rem;">🚗 Drive&Joy</h1>
        <p style="color:#9ca3af;font-size:1.2rem;">Auto nuove e usate selezionate per te • Tutte disponibili in leasing o noleggio</p>
    </div>
""", unsafe_allow_html=True)

# 📥 Carica dati
file_path = os.path.join("data", "Drive_&_Joy_ALD.csv")
try:
    df = pd.read_csv(file_path, sep=";")
except:
    st.error("⚠️ Impossibile caricare il file CSV.")
    st.stop()

# Mostra tutto, no filtro iniziale
st.markdown("<div class='gallery'>", unsafe_allow_html=True)

for idx, row in df.iterrows():
    image_url = row.get("Immagine Copertina", "")
    titolo = f"{row['Brand']} {row['Modello']}"
    allestimento = row.get("Allestimento", "")
    prezzo = row.get("Prezzo", "N/D")
    alimentazione = row.get("Alimentazione", "")
    cambio = row.get("Cambio", "")
    trazione = row.get("Trazione", "")
    pronta = row.get("Pronta Consegna", "")

    st.markdown(f"""
    <div class="card">
        <img src="{image_url if pd.notna(image_url) else 'https://via.placeholder.com/300x200?text=No+Image'}" style="width:100%;border-radius:10px;">
        <h3>{titolo}</h3>
        <p>{allestimento}</p>
        <p><strong>Prezzo:</strong> € {prezzo}</p>
        <p><strong>Alimentazione:</strong> {alimentazione} | <strong>Cambio:</strong> {cambio}</p>
        <p><strong>Trazione:</strong> {trazione} | <strong>Pronta consegna:</strong> {pronta}</p>
    </div>
    """, unsafe_allow_html=True)

st.markdown("</div>", unsafe_allow_html=True)
