## Documentazione dell'API di PiggyPocket - Autenticazione

Per accedere alle risorse protette dell'API di PiggyPocket, gli utenti devono autenticarsi. Questa guida spiega come l'utente può autenticarsi utilizzando il processo di autenticazione combinato.

Il processo di autenticazione combinato accetta un token di autenticazione fornito dall'utente attraverso l'header della richiesta (`Authorization`) o il corpo della richiesta (`token`).

Il token di autenticazione si può ottenere tramite la pagina impostazioni dell'utente.

Ecco come effettuare l'autenticazione:

1. Includi il token di autenticazione nella richiesta utilizzando uno dei seguenti metodi:
   - **Header**: Aggiungi l'header `Authorization` alla tua richiesta con il valore del token. L'header dovrebbe seguire lo schema `Authorization: <token>`. Ad esempio:

     ```
     Authorization: <token_di_autenticazione>
     ```

   - **Corpo della richiesta**: Includi il token di autenticazione nel corpo della richiesta come parametro con il nome `token`. Ad esempio:

     ```
     POST /api/richiesta HTTP/1.1
     Content-Type: application/json

     {
       "token": "<token_di_autenticazione>"
     }
     ```

2. Il server verificherà il token di autenticazione fornito. Ecco come avviene la verifica:
   - Il token viene estratto dall'header `Authorization` o dal corpo della richiesta.
   - Il token viene hashato utilizzando l'algoritmo SHA-256.
   - Viene effettuata una ricerca nel database per trovare un utente corrispondente al token hashato.
   - Se l'utente viene trovato nel database, l'autenticazione viene considerata valida e l'utente viene autorizzato ad accedere alle risorse protette.
   - Se l'utente non viene trovato nel database, l'autenticazione viene considerata non valida e viene restituito un errore di autenticazione.

Se il processo di autenticazione ha successo, l'utente sarà autorizzato ad accedere alle risorse protette dell'API di PiggyPocket. In caso di errori di autenticazione, verrà restituito un messaggio di errore appropriato con lo stato HTTP 401 (Non autorizzato).

Assicurati di includere il token di autenticazione corretto nella tua richiesta per accedere alle risorse protette dell'API di PiggyPocket.

*Ricorda di proteggere il tuo token di autenticazione e di trattarlo come informazione sensibile. Non condividere il token con altri e assicurati di utilizzare connessioni sicure (HTTPS) per proteggere la trasmissione del token durante le richieste API.*

## Documentazione dell'API di PiggyPocket - Endpoint Utenti

Questo documento fornisce una descrizione dell'endpoint API per ottenere le informazioni dell'utente corrente (`/api/users/@me`) nell'applicazione PiggyPocket.

### Struttura del Database

Il database contiene la tabella `users` con i seguenti campi:

- `id`: Identificatore dell'utente (di tipo `TEXT`).
- `name`: Nome dell'utente (di tipo `TEXT`).
- `email`: Indirizzo email dell'utente (di tipo `TEXT`).
- `picture`: URL dell'immagine del profilo dell'utente (di tipo `TEXT`).
- `token`: Token di autenticazione dell'utente (di tipo `TEXT`).

### Endpoint API

Il seguente endpoint API è disponibile per ottenere le informazioni dell'utente corrente:

- **GET /api/users/@me**

  Questo endpoint restituisce le informazioni dell'utente corrente. L'utente deve essere autenticato per accedere a questo endpoint. Le informazioni restituite includono l'identificatore dell'utente (`id`), il nome (`name`), l'indirizzo email (`email`) e l'URL dell'immagine del profilo (`picture`).

  Esempio di richiesta:
  ```
  GET /api/users/@me HTTP/1.1
  Host: example.com
  Authorization: <token_di_autenticazione>
  ```

  Esempio di risposta:
  ```json
  {
    "id": "123456",
    "name": "Mario Rossi",
    "email": "mario@example.com",
    "picture": "https://example.com/profile.jpg"
  }
  ```

  **Note**:
  - Assicurati di includere l'header `Authorization` nella richiesta con il token di autenticazione valido per accedere alle informazioni dell'utente corrente.
  - In caso di mancata autenticazione o token di autenticazione non valido, verrà restituito uno stato HTTP 401 (Non autorizzato) con un messaggio di errore corrispondente.



*Ricorda di proteggere le informazioni dell'utente e di trattarle come dati sensibili. Assicurati di utilizzare connessioni sicure (HTTPS) per proteggere la trasmissione dei dati durante le richieste API.*

## Documentazione dell'API di PiggyPocket - Endpoint Transazioni

Questo documento fornisce una descrizione dell'endpoint API per ottenere le transazioni dell'utente corrente (`/api/transactions/@me`) nell'applicazione PiggyPocket.

### Struttura del Database

Il database contiene la tabella `expenses` con i seguenti campi:

- `id`: Identificatore della transazione (di tipo `TEXT`).
- `user_id`: Identificatore dell'utente proprietario della transazione (di tipo `TEXT`).
- `date`: Data della transazione (di tipo `TEXT`).
- `amount`: Importo della transazione (di tipo `REAL`).
- `description`: Descrizione della transazione (di tipo `TEXT`).
- `category`: Categoria della transazione (di tipo `TEXT`).
- `payee`: Beneficiario della transazione (di tipo `TEXT`).

### Endpoint API

Il seguente endpoint API è disponibile per ottenere le transazioni dell'utente corrente:

- **GET /api/transactions/@me**

  Questo endpoint restituisce le transazioni dell'utente corrente con opzioni di filtro e paginazione. L'utente deve essere autenticato per accedere a questo endpoint.

  Parametri della query disponibili:
  - `page` (opzionale): Numero di pagina per la paginazione delle transazioni.
  - `category` (opzionale): Categoria delle transazioni da filtrare.
  - `type` (opzionale): Tipo di transazioni da filtrare (`income` per le entrate, qualsiasi altro valore per le uscite).
  - `date_span` (opzionale): Intervallo di date delle transazioni da filtrare (`week` per la settimana corrente, `month` per il mese corrente, `year` per l'anno corrente).
  - `search` (opzionale): Termine di ricerca per filtrare le transazioni in base alla descrizione o al beneficiario.

  Esempio di richiesta:
  ```
  GET /api/transactions/@me?page=1&category=groceries&type=expense&date_span=month&search=food HTTP/1.1
  Host: example.com
  Authorization: <token_di_autenticazione>
  ```

  Esempio di risposta:
  ```json
  {
    "expenses": [
      {
        "id": "123456",
        "user_id": "7890",
        "date": "2023-05-20",
        "amount": 25.0,
        "description": "Spesa al supermercato",
        "category": "groceries",
        "payee": "Supermarket XYZ"
      },
      {
        "id": "789012",
        "user_id": "7890",
        "date": "2023-05-18",
        "amount": 15.0,
        "description": "Pranzo al ristorante",
        "category": "dining",
        "payee": "Restaurant ABC"
      }
    ],
    "totalPages": 3
  }
  ```

  **Note**:
  - Assicurati di includere l'header `Authorization` nella richiesta con il token di autenticazione valido per accedere alle transazioni dell'utente corrente.
  - Puoi utilizzare i parametri della query per filtrare le transazioni in base alle tue esigenze.
  - Le transazioni

 sono restituite in base alla paginazione, con un numero predefinito di transazioni per pagina (10 nel nostro caso).
  - La risposta include l'array `expenses` contenente le transazioni e il campo `totalPages` che indica il numero totale di pagine disponibili in base alle transazioni filtrate.


*Ricorda di proteggere le informazioni dell'utente e di trattarle come dati sensibili. Assicurati di utilizzare connessioni sicure (HTTPS) per proteggere la trasmissione dei dati durante le richieste API.*

## Documentazione dell'API di PiggyPocket - Endpoint Dettaglio Transazione

Questo documento fornisce una descrizione dell'endpoint API per ottenere il dettaglio di una transazione specifica dell'utente corrente (`/api/transactions/@me/:id`) nell'applicazione PiggyPocket.

### Struttura del Database

Il database contiene la tabella `expenses` con i seguenti campi:

- `id`: Identificatore della transazione (di tipo `TEXT`).
- `user_id`: Identificatore dell'utente proprietario della transazione (di tipo `TEXT`).
- `date`: Data della transazione (di tipo `TEXT`).
- `amount`: Importo della transazione (di tipo `REAL`).
- `description`: Descrizione della transazione (di tipo `TEXT`).
- `category`: Categoria della transazione (di tipo `TEXT`).
- `payee`: Beneficiario della transazione (di tipo `TEXT`).

### Endpoint API

Il seguente endpoint API è disponibile per ottenere il dettaglio di una transazione specifica dell'utente corrente:

- **GET /api/transactions/@me/:id**

  Questo endpoint restituisce il dettaglio di una transazione specifica dell'utente corrente in base all'ID della transazione fornito. L'utente deve essere autenticato per accedere a questo endpoint.

  Parametri dell'URL:
  - `id`: ID della transazione da ottenere.

  Esempio di richiesta:
  ```
  GET /api/transactions/@me/123456 HTTP/1.1
  Host: example.com
  Authorization: <token_di_autenticazione>
  ```

  Esempio di risposta:
  ```json
  {
    "id": "123456",
    "user_id": "7890",
    "date": "2023-05-20",
    "amount": 25.0,
    "description": "Spesa al supermercato",
    "category": "groceries",
    "payee": "Supermarket XYZ"
  }
  ```

  **Note**:
  - Assicurati di includere l'header `Authorization` nella richiesta con il token di autenticazione valido per accedere alla transazione dell'utente corrente.
  - L'ID della transazione è specificato come parametro nell'URL.
  - La risposta restituisce il dettaglio completo della transazione corrispondente all'ID fornito.

*Ricorda di proteggere le informazioni dell'utente e di trattarle come dati sensibili. Assicurati di utilizzare connessioni sicure (HTTPS) per proteggere la trasmissione dei dati durante le richieste API.*

## Documentazione dell'API di PiggyPocket - Endpoint Immagine Beneficiario

Questo documento fornisce una descrizione dell'endpoint API per ottenere l'immagine di un beneficiario specifico (`/api/payee_picture/:id`) nell'applicazione PiggyPocket.

### Endpoint API

Il seguente endpoint API è disponibile per ottenere l'immagine di un beneficiario specifico:

- **GET /api/payee_picture/:id**

  Questo endpoint restituisce l'immagine corrispondente al beneficiario specificato in base all'ID fornito. L'immagine sarà presa dalla cartella `/assets/payees` dell'applicazione PiggyPocket.

  Parametri dell'URL:
  - `id`: ID del beneficiario.

  Esempio di richiesta:
  ```
  GET /api/payee_picture/123456 HTTP/1.1
  Host: example.com
  ```

  Esempio di risposta:
  - Se l'immagine del beneficiario esiste nella cartella `/assets/payees` con il nome `123456.png`, verrà restituita l'immagine corrispondente.
  - Se l'immagine del beneficiario non esiste, verrà restituita un'immagine predefinita denominata `default.png` dalla cartella `/assets/payees`.

  **Note**:
  - L'ID del beneficiario è specificato come parametro nell'URL.
  - Assicurati che la cartella `/assets/payees` contenga le immagini dei beneficiari nel formato corretto (ad esempio, `123456.png`) e l'immagine predefinita `default.png`.
  - La risposta restituirà l'immagine corrispondente al beneficiario specificato o l'immagine predefinita se non esiste l'immagine del beneficiario.

*Ricorda di proteggere le informazioni dell'utente e di trattarle come dati sensibili. Assicurati di utilizzare connessioni sicure (HTTPS) per proteggere la trasmissione dei dati durante le richieste API.*

## Documentazione dell'API di PiggyPocket - Endpoint Categorie dell'Utente

Questo documento fornisce una descrizione dell'endpoint API per ottenere le categorie dell'utente (`/api/categories/@me`) nell'applicazione PiggyPocket.

### Endpoint API

Il seguente endpoint API è disponibile per ottenere le categorie dell'utente:

- **GET /api/categories/@me**

  Questo endpoint restituisce un elenco delle categorie utilizzate dall'utente, comprese le categorie di default predefinite.

  Esempio di richiesta:
  ```
  GET /api/categories/@me HTTP/1.1
  Host: example.com
  ```

  Esempio di risposta:
  ```
  [
    "Food",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Bills",
    "Health",
    "Travel",
    "Education"
  ]
  ```

  **Note**:
  - L'endpoint restituirà un array di categorie che includerà sia le categorie utilizzate dall'utente che le categorie di default predefinite.
  - Le categorie utilizzate dall'utente sono ottenute dalla tabella `expenses` del database in base all'ID dell'utente corrente.
  - Le categorie di default predefinite sono definite nell'array `defaultCategories` nel codice.

*Ricorda di proteggere le informazioni dell'utente e di trattarle come dati sensibili. Assicurati di utilizzare connessioni sicure (HTTPS) per proteggere la trasmissione dei dati durante le richieste API.*

## Documentazione dell'API di PiggyPocket - Endpoint Beneficiari dell'Utente

Questo documento fornisce una descrizione dell'endpoint API per ottenere i beneficiari dell'utente (`/api/payees/@me`) nell'applicazione PiggyPocket.

### Endpoint API

Il seguente endpoint API è disponibile per ottenere i beneficiari dell'utente:

- **GET /api/payees/@me**

  Questo endpoint restituisce un elenco dei beneficiari utilizzati dall'utente, compresi i beneficiari predefiniti predefiniti.

  Esempio di richiesta:
  ```
  GET /api/payees/@me HTTP/1.1
  Host: example.com
  ```

  Esempio di risposta:
  ```
  [
    "Netflix",
    "Amazon",
    "Ebay",
    "Esselunga",
    "Coop",
    "Conad",
    "Carrefour",
    "Ipercoop",
    "Lidl",
    "Pam",
    ...
  ]
  ```

  **Note**:
  - L'endpoint restituirà un array di beneficiari che includerà sia i beneficiari utilizzati dall'utente che i beneficiari predefiniti predefiniti.
  - I beneficiari utilizzati dall'utente sono ottenuti dalla tabella `expenses` del database in base all'ID dell'utente corrente.
  - I beneficiari predefiniti predefiniti sono definiti nell'array `defaultPayees` nel codice.

*Ricorda di proteggere le informazioni dell'utente e di trattarle come dati sensibili. Assicurati di utilizzare connessioni sicure (HTTPS) per proteggere la trasmissione dei dati durante le richieste API.*

## Documentazione dell'API di PiggyPocket - Endpoint Aggiungi Transazione

Questo documento fornisce una descrizione dell'endpoint API per aggiungere una nuova transazione (`/api/transactions/@me`) nell'applicazione PiggyPocket.

### Struttura del Database

Il database contiene la tabella `expenses` con i seguenti campi:

- `id`: Identificatore della transazione (di tipo `TEXT`).
- `user_id`: Identificatore dell'utente proprietario della transazione (di tipo `TEXT`).
- `date`: Data della transazione (di tipo `TEXT`).
- `amount`: Importo della transazione (di tipo `REAL`).
- `description`: Descrizione della transazione (di tipo `TEXT`).
- `category`: Categoria della transazione (di tipo `TEXT`).
- `payee`: Beneficiario della transazione (di tipo `TEXT`).

### Endpoint API

Il seguente endpoint API è disponibile per aggiungere una nuova transazione:

- **POST /api/transactions/@me**

  Questo endpoint consente di aggiungere una nuova transazione per l'utente corrente.

  Esempio di richiesta:
  ```
  POST /api/transactions/@me HTTP/1.1
  Host: example.com
  Content-Type: application/json

  {
    "payee": "Netflix",
    "category": "Abbonamenti",
    "description": "Abbonamento mensile a Netflix",
    "amount": 12.99,
    "date": "2023-05-21"
  }
  ```

  Esempio di risposta (successo):
  ```
  HTTP/1.1 201 Created
  Content-Type: application/json

  {
    "id": 12345
  }
  ```

  Esempio di risposta (errore):
  ```
  HTTP/1.1 400 Bad Request
  Content-Type: application/json

  {
    "error": "Payee is required"
  }
  ```

  **Note**:
  - L'endpoint richiede l'autenticazione dell'utente per aggiungere una transazione al suo account.
  - I dati della transazione vengono inviati nel corpo della richiesta in formato JSON.
  - Prima di aggiungere la transazione, vengono effettuati controlli appropriati per verificare la validità dei dati:
    - Il beneficiario (`payee`) è obbligatorio.
    - La categoria (`category`) è obbligatoria.
    - La descrizione (`description`) è obbligatoria.
    - L'importo (`amount`) è obbligatorio e deve essere un numero.
    - La data (`date`) è obbligatoria e deve essere una data valida.
  - Se tutti i controlli vengono superati correttamente, la transazione viene aggiunta al database e viene restituito l'ID della transazione appena creata.
  - In caso di errori durante l'aggiunta della transazione, verrà restituito un messaggio di errore appropriato.

*Ricorda di proteggere le informazioni dell'utente e di trattarle come dati sensibili. Assicurati di utilizzare connessioni sicure (HTTPS) per proteggere la trasmissione dei dati durante le richieste API.*

## Documentazione dell'API di PiggyPocket - Endpoint Modifica Transazione

Questo documento fornisce una descrizione dell'endpoint API per modificare una transazione esistente (`/api/transactions/@me/:id`) nell'applicazione PiggyPocket.

### Struttura del Database

Il database contiene la tabella `expenses` con i seguenti campi:

- `id`: Identificatore della transazione (di tipo `TEXT`).
- `user_id`: Identificatore dell'utente proprietario della transazione (di tipo `TEXT`).
- `date`: Data della transazione (di tipo `TEXT`).
- `amount`: Importo della transazione (di tipo `REAL`).
- `description`: Descrizione della transazione (di tipo `TEXT`).
- `category`: Categoria della transazione (di tipo `TEXT`).
- `payee`: Beneficiario della transazione (di tipo `TEXT`).

### Endpoint API

Il seguente endpoint API è disponibile per modificare una transazione esistente:

- **PUT /api/transactions/@me/:id**

  Questo endpoint consente di modificare una transazione per l'utente corrente, specificando l'ID della transazione da modificare come parte dell'URL.

  Esempio di richiesta:
  ```
  PUT /api/transactions/@me/12345 HTTP/1.1
  Host: example.com
  Content-Type: application/json

  {
    "payee": "Netflix",
    "category": "Intrattenimento",
    "description": "Abbonamento mensile a Netflix",
    "amount": 15.99,
    "date": "2023-05-21"
  }
  ```

  Esempio di risposta (successo):
  ```
  HTTP/1.1 200 OK
  Content-Type: application/json

  {
    "id": 12345
  }
  ```

  Esempio di risposta (errore):
  ```
  HTTP/1.1 400 Bad Request
  Content-Type: application/json

  {
    "error": "Payee is required"
  }
  ```

  **Note**:
  - L'endpoint richiede l'autenticazione dell'utente per modificare una transazione nel suo account.
  - L'ID della transazione da modificare viene specificato come parte dell'URL.
  - I dati della transazione da modificare vengono inviati nel corpo della richiesta in formato JSON.
  - Prima di effettuare la modifica, vengono effettuati controlli appropriati per verificare la validità dei dati:
    - Il beneficiario (`payee`) è obbligatorio.
    - La categoria (`category`) è obbligatoria.
    - La descrizione (`description`) è obbligatoria.
    - L'importo (`amount`) è obbligatorio e deve essere un numero.
    - La data (`date`) è obbligatoria e deve essere una data valida.
  - Se tutti i controlli vengono superati correttamente, la transazione nel database viene modificata con i nuovi dati forniti.
  - In caso di successo, viene restituito l'ID della transazione modificata.
  - In caso di errori durante la modifica della transazione, verrà restituito un messaggio di errore appropriato.

*Ricorda di proteggere le informazioni dell'utente e di trattarle come dati sensibili. Assicurati di utilizzare connessioni sicure (HTTPS) per proteggere la trasmissione dei dati durante le richieste API.*

## Documentazione dell'API di PiggyPocket - Endpoint Elimina Transazione

Questo documento fornisce una descrizione dell'endpoint API per eliminare una transazione esistente (`/api/transactions/@me/:id`) nell'applicazione PiggyPocket.

### Struttura del Database

Il database contiene la tabella `expenses` con i seguenti campi:

- `id`: Identificatore della transazione (di tipo `TEXT`).
- `user_id`: Identificatore dell'utente proprietario della transazione (di tipo `TEXT`).
- `date`: Data della transazione (di tipo `TEXT`).
- `amount`: Importo della transazione (di tipo `REAL`).
- `description`: Descrizione della transazione (di tipo `TEXT`).
- `category`: Categoria della transazione (di tipo `TEXT`).
- `payee`: Beneficiario della transazione (di tipo `TEXT`).

### Endpoint API

Il seguente endpoint API è disponibile per eliminare una transazione esistente:

- **DELETE /api/transactions/@me/:id**

  Questo endpoint consente di eliminare una transazione per l'utente corrente, specificando l'ID della transazione da eliminare come parte dell'URL.

  Esempio di richiesta:
  ```
  DELETE /api/transactions/@me/12345 HTTP/1.1
  Host: example.com
  ```

  Esempio di risposta (successo):
  ```
  HTTP/1.1 200 OK
  Content-Type: application/json

  {
    "id": 12345
  }
  ```

  Esempio di risposta (errore):
  ```
  HTTP/1.1 500 Internal Server Error
  Content-Type: application/json

  {
    "error": "Something went wrong, please try again later..."
  }
  ```

  **Note**:
  - L'endpoint richiede l'autenticazione dell'utente per eliminare una transazione dal suo account.
  - L'ID della transazione da eliminare viene specificato come parte dell'URL.
  - Se esiste una transazione corrispondente all'ID specificato e appartenente all'utente corrente, verrà eliminata dal database.
  - In caso di successo, viene restituito l'ID della transazione eliminata.
  - In caso di errori durante l'eliminazione della transazione, verrà restituito un messaggio di errore appropriato.

*Ricorda di proteggere le informazioni dell'utente e di trattarle come dati sensibili. Assicurati di utilizzare connessioni sicure (HTTPS) per proteggere la trasmissione dei dati durante le richieste API.*

## Documentazione dell'API di PiggyPocket - Endpoint Statistiche Utente

Questo documento fornisce una descrizione dell'endpoint API per ottenere le statistiche dell'utente (`/api/stats/@me`) nell'applicazione PiggyPocket.

### Endpoint API

Il seguente endpoint API è disponibile per ottenere le statistiche dell'utente:

- **GET /api/stats/@me**

  Questo endpoint consente di recuperare le statistiche relative alle spese e ai guadagni dell'utente corrente negli ultimi 12 mesi.

  Esempio di richiesta:
  ```
  GET /api/stats/@me HTTP/1.1
  Host: example.com
  Authorization: <token>
  ```

  Esempio di risposta (successo):
  ```
  HTTP/1.1 200 OK
  Content-Type: application/json

  {
    "category": [
      {
        "category": "Alimentari",
        "total_amount": 250.0
      },
      {
        "category": "Trasporti",
        "total_amount": 120.0
      },
      ...
    ],
    "monthlyExpenses": [
      {
        "month": "2022-05",
        "total_amount": 350.0
      },
      {
        "month": "2022-06",
        "total_amount": 450.0
      },
      ...
    ],
    "monthlyIncome": [
      {
        "month": "2022-05",
        "total_amount": 2000.0
      },
      {
        "month": "2022-06",
        "total_amount": 1800.0
      },
      ...
    ],
    "weeklyTransactions": [
      {
        "day_of_week": "1",
        "transaction_count": 5
      },
      {
        "day_of_week": "2",
        "transaction_count": 8
      },
      ...
    ]
  }
  ```

  Esempio di risposta (errore):
  ```
  HTTP/1.1 500 Internal Server Error
  Content-Type: application/json

  {
    "error": "Error retrieving stats data"
  }
  ```

  **Note**:
  - L'endpoint richiede l'autenticazione dell'utente tramite il token di accesso.
  - Le statistiche fornite includono informazioni sulle categorie di spese, le spese mensili, i guadagni mensili e le transazioni settimanali dell'utente negli ultimi 12 mesi.
  - I dati sono raggruppati e restituiti in formato JSON.
  - In caso di successo, viene restituito un oggetto JSON che contiene le statistiche.
  - In caso di errori durante il recupero dei dati statistici, verrà restituito un messaggio di errore appropriato.

*Ricorda di proteggere le informazioni dell'utente e di trattarle come dati sensibili. Assicurati di utilizzare connessioni sicure (HTTPS) per proteggere la trasmissione dei dati durante le richieste API.*

## Documentazione dell'API di PiggyPocket - Endpoint Dati Utente

Questo documento fornisce una descrizione dell'endpoint API per ottenere tutti i dati dell'utente (`/api/data/@me`) nell'applicazione PiggyPocket.

### Endpoint API

Il seguente endpoint API è disponibile per ottenere tutti i dati dell'utente:

- **GET /api/data/@me**

  Questo endpoint consente di recuperare tutte le informazioni dell'utente, comprese le spese e i rapporti associati.

  Esempio di richiesta:
  ```
  GET /api/data/@me HTTP/1.1
  Host: example.com
  Authorization: <token>
  ```

  Esempio di risposta (successo):
  ```
  HTTP/1.1 200 OK
  Content-Type: application/json

  {
    "user": {
      "id": "123456789",
      "name": "Mario Rossi",
      "email": "mario@example.com",
      "picture": "https://example.com/profile-picture.jpg"
    },
    "expenses": [
      {
        "id": "tr123456789",
        "user_id": "123456789",
        "date": "2023-05-20",
        "amount": 50.0,
        "description": "Spesa supermercato",
        "category": "Alimentari",
        "payee": "Esselunga"
      },
      {
        "id": "tr987654321",
        "user_id": "123456789",
        "date": "2023-05-18",
        "amount": 25.0,
        "description": "Benzina",
        "category": "Trasporti",
        "payee": "Q8"
      },
      ...
    ],
    "reports": [
      {
        "id": "r123456789",
        "user_id": "123456789",
        "year": 2023,
        "month": 5,
        "content": "Questo è il report del mese di maggio 2023."
      },
      {
        "id": "r987654321",
        "user_id": "123456789",
        "year": 2023,
        "month": 4,
        "content": "Questo è il report del mese di aprile 2023."
      },
      ...
    ]
  }
  ```

  Esempio di risposta (errore):
  ```
  HTTP/1.1 500 Internal Server Error
  Content-Type: application/json

  {
    "error": "Error retrieving user data"
  }
  ```

  **Note**:
  - L'endpoint richiede l'autenticazione dell'utente tramite il token di accesso.
  - Vengono restituite tutte le informazioni dell'utente, compresi i dettagli dell'utente, le spese e i rapporti associati.
  - I dati delle spese vengono ordinati in base alla data decrescente.
  - I dati dei rapporti vengono ordinati in base alla data (anno e mese) decrescente.
  - In caso di successo, viene restituito un oggetto JSON che contiene le informazioni dell'utente, le spese e i rapporti.
  - In caso di errori durante il recupero dei dati dell'utente, verrà restituito un messaggio di errore appropriato.

*Ricorda di proteggere le informazioni dell'utente e di trattarle come dati sensibili. Assicurati di utilizzare connessioni sicure (HTTPS) per proteggere la trasmissione dei dati durante le richieste API.*

## Documentazione dell'API di PiggyPocket - Endpoint Panoramica

Questo documento fornisce una descrizione dell'endpoint API per ottenere i dati di panoramica dell'utente (`/api/overview/@me`) nell'applicazione PiggyPocket.

### Endpoint API

Il seguente endpoint API è disponibile per ottenere i dati di panoramica dell'utente:

- **GET /api/overview/@me**

  Questo endpoint consente di recuperare il conteggio delle transazioni, l'importo totale delle spese e l'importo totale dei guadagni suddivisi per mese.

  Esempio di richiesta:
  ```
  GET /api/overview/@me HTTP/1.1
  Host: example.com
  Authorization: <token>
  ```

  Esempio di risposta (successo):
  ```
  HTTP/1.1 200 OK
  Content-Type: application/json

  {
    "transactionCount": [
      {
        "month": "2023-05",
        "total_count": 10
      },
      {
        "month": "2023-04",
        "total_count": 8
      },
      ...
    ],
    "totalExpenses": [
      {
        "month": "2023-05",
        "total_amount": -500.0
      },
      {
        "month": "2023-04",
        "total_amount": -400.0
      },
      ...
    ],
    "totalIncome": [
      {
        "month": "2023-05",
        "total_amount": 1000.0
      },
      {
        "month": "2023-04",
        "total_amount": 800.0
      },
      ...
    ]
  }
  ```

  Esempio di risposta (errore):
  ```
  HTTP/1.1 500 Internal Server Error
  Content-Type: application/json

  {
    "error": "Error retrieving overview data"
  }
  ```

  **Note**:
  - L'endpoint richiede l'autenticazione dell'utente tramite il token di accesso.
  - Vengono restituiti il conteggio delle transazioni, l'importo totale delle spese e l'importo totale dei guadagni suddivisi per mese.
  - I dati vengono ordinati in base al mese in ordine decrescente.
  - In caso di successo, viene restituito un oggetto JSON che contiene il conteggio delle transazioni, l'importo totale delle spese e l'importo totale dei guadagni.
  - In caso di errori durante il recupero dei dati di panoramica, verrà restituito un messaggio di errore appropriato.

*Ricorda di proteggere le informazioni dell'utente e di trattarle come dati sensibili. Assicurati di utilizzare connessioni sicure (HTTPS) per proteggere la trasmissione dei dati durante le richieste API.*

## Documentazione dell'API di PiggyPocket - Endpoint Rapporto Singolo

Questo documento fornisce una descrizione dell'endpoint API per ottenere i dati di un singolo rapporto dell'utente (`/api/reports/@me/:yearmonth`) nell'applicazione PiggyPocket.

### Endpoint API

Il seguente endpoint API è disponibile per ottenere i dati di un singolo rapporto dell'utente:

- **GET /api/reports/@me/:yearmonth**

  Questo endpoint consente di recuperare i dati di un rapporto specifico dell'utente in base all'anno e al mese forniti.

  Esempio di richiesta:
  ```
  GET /api/reports/@me/2023-05 HTTP/1.1
  Host: example.com
  Authorization: <token>
  ```

  Esempio di risposta (successo):
  ```
  HTTP/1.1 200 OK
  Content-Type: application/json

  {
    "id": "report_id",
    "user_id": "user_id",
    "year": 2023,
    "month": 5,
    "content": "Contenuto del rapporto"
  }
  ```

  Esempio di risposta (nessun rapporto trovato):
  ```
  HTTP/1.1 200 OK
  Content-Type: application/json

  {
    "content": ""
  }
  ```

  Esempio di risposta (errore):
  ```
  HTTP/1.1 500 Internal Server Error
  Content-Type: application/json

  {
    "error": "Error retrieving report data"
  }
  ```

  **Note**:
  - L'endpoint richiede l'autenticazione dell'utente tramite il token di accesso.
  - L'anno e il mese del rapporto vengono specificati nel percorso dell'URL come `:yearmonth` nel formato "YYYY-MM" (ad esempio, "2023-05" per maggio 2023).
  - Viene effettuata una ricerca nel database per il rapporto corrispondente all'utente, all'anno e al mese forniti.
  - In caso di successo, viene restituito un oggetto JSON che contiene i dati del rapporto, inclusi l'ID del rapporto, l'ID dell'utente, l'anno, il mese e il contenuto del rapporto.
  - Se nessun rapporto viene trovato corrispondente all'utente, all'anno e al mese forniti, viene restituito un oggetto JSON vuoto con il campo "content" impostato su una stringa vuota.
  - In caso di errori durante il recupero dei dati del rapporto, verrà restituito un messaggio di errore appropriato.

*Ricorda di proteggere le informazioni dell'utente e di trattarle come dati sensibili. Assicurati di utilizzare connessioni sicure (HTTPS) per proteggere la trasmissione dei dati durante le richieste API.*

## Documentazione dell'API di PiggyPocket - Endpoint Creazione/Aggiornamento Rapporto

Questo documento fornisce una descrizione dell'endpoint API per creare o aggiornare un rapporto dell'utente nell'applicazione PiggyPocket (`/api/reports/@me/:yearmonth`).

### Endpoint API

Il seguente endpoint API è disponibile per creare o aggiornare un rapporto dell'utente:

- **POST /api/reports/@me/:yearmonth**

  Questo endpoint consente di creare o aggiornare un rapporto dell'utente in base all'anno e al mese forniti. Utilizza l'intelligenza artificiale per generare una risposta basata sulle spese dell'utente.

  Esempio di richiesta:
  ```
  POST /api/reports/@me/2023-05 HTTP/1.1
  Host: example.com
  Authorization: <token>
  Content-Type: application/json

  {}
  ```

  Esempio di risposta (successo):
  ```
  HTTP/1.1 200 OK
  Content-Type: application/json

  {
    "content": "Ecco alcuni consigli per migliorare la tua situazione finanziaria:\n\n- Riduci le spese per l'alloggio cercando soluzioni abitative più economiche o coinquilini.\n- Fai attenzione alle tue spese alimentari, cerca offerte e promozioni nei supermercati.\n- Considera l'utilizzo di app o strumenti per la gestione del budget per tenere traccia delle tue spese mensili."
  }
  ```

  Esempio di risposta (errore):
  ```
  HTTP/1.1 500 Internal Server Error
  Content-Type: application/json

  {
    "error": "Error creating report"
  }
  ```

  **Note**:
  - L'endpoint richiede l'autenticazione dell'utente tramite il token di accesso.
  - L'anno e il mese del rapporto vengono specificati nel percorso dell'URL come `:yearmonth` nel formato "YYYY-MM" (ad esempio, "2023-05" per maggio 2023).
  - La richiesta POST non richiede alcun dato nel corpo della richiesta. Le informazioni sulle spese dell'utente vengono recuperate internamente dal server.
  - Il server genera automaticamente un prompt basato sulle spese dell'utente per il mese specificato.
  - Il prompt viene inviato all'intelligenza artificiale per ottenere una risposta personalizzata basata sulle spese dell'utente.
  - In caso di successo, viene restituita la risposta generata dall'intelligenza artificiale come campo "content" nell'oggetto JSON di risposta.
  - In caso di errore durante la creazione o l'aggiornamento del rapporto, viene restituito un oggetto JSON di errore con un campo "error" che descrive l'errore specifico.

*Ricorda di proteggere le informazioni dell'utente e di trattarle come dati sensibili. Assicurati di utilizzare connessioni sicure (HTTPS) per proteggere la trasmissione dei dati durante le richieste API.*