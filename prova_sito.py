# -*- coding: utf-8 -*-
"""
Created on Fri Apr 18 19:47:41 2025

@author: utente
"""

import streamlit as st
import pandas as pd

st.set_page_config(page_title="Drive&Joy", layout="wide")

st.title("🚗 Drive&Joy - Offerte Auto")

# Caricamento del file
uploaded_file = st.file_uploader("Carica il file 'Drive_&_Joy_ALD.csv'", type=["csv"])

if uploaded_file:
    df = pd.read_csv(uploaded_file, sep=";")

    # Selezione tipologia
    tipologia_scelta = st.radio("Seleziona tipologia di veicolo", ["Auto Nuove", "Auto Usate"])
    if tipologia_scelta == "Auto Nuove":
        df = df[df["Tipologia"].str.lower().str.contains("nuovo", na=False)]
    else:
        df = df[df["Tipologia"].str.lower().str.contains("usato", na=False)]

    # Filtri
    st.sidebar.header("🔍 Filtra i veicoli")
    brand = st.sidebar.multiselect("Marca", sorted(df["Brand"].dropna().unique()))
    alimentazione = st.sidebar.multiselect("Alimentazione", sorted(df["Alimentazione"].dropna().unique()))
    cambio = st.sidebar.multiselect("Cambio", sorted(df["Cambio"].dropna().unique()))

    if brand:
        df = df[df["Brand"].isin(brand)]
    if alimentazione:
        df = df[df["Alimentazione"].isin(alimentazione)]
    if cambio:
        df = df[df["Cambio"].isin(cambio)]

    # Visualizzazione
    for i, row in df.iterrows():
        with st.container():
            cols = st.columns([1, 2])
            with cols[0]:
                img_url = row.get("Immagine Copertina", "")
                if pd.notna(img_url) and img_url.startswith("http"):
                    st.image(img_url, caption=f"{row['Brand']} {row['Modello']}", use_column_width=True)
            with cols[1]:
                st.subheader(f"{row['Brand']} {row['Modello']} - {row.get('Allestimento', '')}")
                st.write(f"**Prezzo**: € {row.get('Prezzo', 'N/D')}")
                st.write(f"**Alimentazione**: {row.get('Alimentazione', '')}")
                st.write(f"**Cambio**: {row.get('Cambio', '')}")
                st.write(f"**Trazione**: {row.get('Trazione', '')}")
                st.write(f"**Pronta Consegna**: {row.get('Pronta Consegna', '')}")

                # Combinazioni di noleggio
                opzioni = []
                for x in range(1, 9):
                    anticipo = row.get(f"Anticipo {x}")
                    durata = row.get(f"Durata {x}")
                    km = row.get(f"Km {x}")
                    canone = row.get(f"Canone {x}")
                    if pd.notna(anticipo) and pd.notna(durata) and pd.notna(km) and pd.notna(canone):
                        opzioni.append(f"{anticipo}€ anticipo | {durata} mesi | {km} km → {canone}€/mese")
                if opzioni:
                    scelta = st.selectbox("💰 Scegli la formula di noleggio/leasing", opzioni, key=f"opt_{i}")
                st.button("📩 Richiedi info", key=f"info_{i}")

                # Player
                player_url = row.get("Link al player", "")
                if pd.notna(player_url) and player_url.startswith("http"):
                    st.markdown(f"🔊 **Anteprima**")
                    st.components.v1.iframe(player_url, height=300)

else:
    st.info("Carica un file CSV per iniziare.")
