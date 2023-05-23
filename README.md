# PiggyPocket

Benvenuto in PiggyPocket! PiggyPocket è un'applicazione di gestione finanziaria che ti aiuta a tenere traccia delle tue spese, a creare rapporti personalizzati e a gestire il tuo budget in modo efficace.

## Descrizione del progetto

PiggyPocket ti permette di registrare le tue transazioni finanziarie, organizzarle per categoria, visualizzare statistiche e generare rapporti personalizzati. L'applicazione offre una panoramica completa delle tue finanze, consentendoti di prendere decisioni informate e di migliorare la tua situazione finanziaria.

## Caratteristiche

- Registrazione delle transazioni finanziarie
- Organizzazione delle transazioni per categoria
- Statistiche dettagliate sulle spese e sui guadagni
- Generazione di rapporti personalizzati
- Gestione del budget mensile
- Interfaccia utente intuitiva e facile da usare

## Documentazione API

La documentazione completa delle API di PiggyPocket è disponibile nel file [API.md](API.md). Questo file fornisce dettagli su tutti gli endpoint API disponibili, i parametri richiesti, le risposte attese e altre informazioni importanti per l'integrazione con l'applicazione.

**[Apri la documentazione delle API](API.md)**

## Installazione

Per installare PiggyPocket sul tuo ambiente locale, segui questi passaggi:

1. Clona il repository PiggyPocket da GitHub: `git clone https://github.com/tuonome/piggypocket.git`
2. Accedi alla cartella del progetto: `cd piggypocket`
3. Installa le dipendenze: `npm install`
4. Configura le variabili d'ambiente:
   - Crea un file `.env` nella cartella principale del progetto
   - Aggiungi le seguenti variabili d'ambiente nel file `.env` e fornisci i valori appropriati:
     ```
     PORT=80
     GOOGLE_CLIENT_ID=abcd1234.apps.googleusercontent.com
     GOOGLE_CLIENT_SECRET=ABCD-EFGH-HIJK
     SESSION_SECRET=abc123
     REDIRECT_HOST=http://example.com
     ```
5. Avvia l'applicazione: `node .`
6. L'applicazione sarà disponibile all'indirizzo `http://localhost:80`

## Licenza

PiggyPocket è distribuito con la licenza AGPLv3. Per ulteriori informazioni, consulta il file [LICENSE](LICENSE).

---

*Nota: PiggyPocket è un progetto immaginario creato a scopo dimostrativo.*