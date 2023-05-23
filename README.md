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

## Utilizzo

Nella pagina principale /home si possono vedere dei grafici che rappresentano alcuni informazioni sulle transazioni eseguite.
Per poter aggiungere nuove transazioni bisogna andare nella pagina transazioni.

Nella pagina transazioni poi bisogna cliccare su "Aggiungi transazione" (Da mobile bisogna aprire il menu), inoltre si possono anche aggiungere dei filtri per poter filtrare le transazioni.

Per modificare una transazione si può cliccare il pulsante apposta (da mobile bisogna cliccare sulla transazione)

Stessa cosa per eliminare una transazione.

Nella pagina riepilogo mensile si può vedere un riepilogo mese per mese delle transazioni effettuate e, se configurato, cliccando su un riepilogo si può far generare un report tramite GPT che analizza le spese.

Nella pagina impostazioni si possono vedere i dati dell'utente, si possono esportare i dati in formato JSON, si possono aggiungere delle transazioni preimpostate e si può eliminare l'account.

## Documentazione API

La documentazione completa delle API di PiggyPocket è disponibile nel file [API.md](API.md). Questo file fornisce dettagli su tutti gli endpoint API disponibili, i parametri richiesti, le risposte attese e altre informazioni importanti per l'integrazione con l'applicazione.

**[Apri la documentazione delle API](API.md)**

## Configurazione del server GPT

PiggyPocket richiede un server GPT (Generative Pre-trained Transformer) per l'elaborazione del linguaggio naturale al fine di generare i rapporti personalizzati. Prima di eseguire l'applicazione, è necessario configurare il server GPT in modo che risponda all'endpoint `POST /api/prompt` con un oggetto JSON che contiene una proprietà `response` corrispondente alla risposta generata da GPT.

Ecco come configurare il server GPT per integrarlo con PiggyPocket:

1. Installa il server GPT sul tuo ambiente locale o su un server remoto seguendo le istruzioni fornite dal fornitore o dal progetto GPT che stai utilizzando.
2. Assicurati che il server GPT sia avviato correttamente e che sia raggiungibile tramite un endpoint API.
3. Configura l'URL del server GPT nell'applicazione PiggyPocket modificando la variabile d'ambiente `GPT_SERVER` nel file `.env`.

   ```
   GPT_SERVER=http://indirizzo_del_tuo_server_gpt
   ```

   Sostituisci `http://indirizzo_del_tuo_server_gpt` con l'URL effettivo del server GPT.

4. Verifica che il server GPT risponda all'endpoint `POST /api/prompt` con un oggetto JSON che contiene una proprietà `response`. Questa proprietà rappresenterà la risposta generata da GPT basandosi sul prompt fornito.

   Esempio di risposta corretta del server GPT:

   ```json
   {
     "response": "La tua risposta generata da GPT."
   }
   ```

   Assicurati che il server GPT sia configurato correttamente per rispondere in questo formato.

Una volta configurato correttamente il server GPT e l'applicazione PiggyPocket con l'URL del server GPT, sarai in grado di generare rapporti personalizzati utilizzando l'intelligenza artificiale del server GPT.

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

## Demo

https://piggypocket.tomaemanuele.it

## Licenza

PiggyPocket è distribuito con la licenza AGPLv3. Per ulteriori informazioni, consulta il file [LICENSE](LICENSE).