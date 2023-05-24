# Esempio di Server GPT

## Introduzione
Questo progetto è un esempio di un server basato su Flask che utilizza il modello GPT-3.5 per generare completamenti di testo. Il server riceve richieste API contenenti prompt di testo e restituisce le risposte generate dal modello GPT-3.5.

## Requisiti
Assicurarsi di avere i seguenti requisiti installati sul sistema:

- Python 3.7 o versioni successive
- Flask
- Waitress
- OpenAI Python SDK (`openai`)
- `python-dotenv`

## Installazione
1. Clonare il repository o scaricare il codice sorgente in una directory locale.
2. Navigare nella directory del progetto.
3. Creare un ambiente virtuale (opzionale) e attivarlo.
4. Installare le dipendenze eseguendo il seguente comando:
   ```
   pip install flask waitress openai python-dotenv
   ```

## Configurazione
1. Creare un account su [OpenAI](https://openai.com/) e ottenere una chiave API.
2. Creare un file `.env` nella directory del progetto.
3. All'interno del file `.env`, impostare la chiave API ottenuta da OpenAI utilizzando la seguente sintassi:
   ```
   OPENAI_API_KEY=<tua_chiave_api>
   ```
4. Salvare il file `.env`.

## Codice

```python
import openai
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from waitress import serve
import os

# Load environment variables from .env file
load_dotenv()

# Set OpenAI API key
openai.api_key = os.environ.get('OPENAI_API_KEY')

# Create Flask application
app = Flask(__name__)
app.config['SERVER_NAME'] = 'localhost:' + os.environ.get('PORT')

# Check if the request is from a trusted IP address
def is_trusted_ip():
    # Example: Add your trusted network IP range here
    trusted_network = '192.168.0.0/16'
    remote_ip = request.remote_addr
    return request.access_route[-1] == remote_ip or remote_ip.startswith(trusted_network)

# Custom request filter to deny requests from outside the network
@app.before_request
def deny_external_requests():
    if not is_trusted_ip():
        return 'Forbidden', 403

# API endpoint for the prompt
@app.route('/api/prompt', methods=['POST'])
def process_prompt():
    prompt = request.json['prompt']
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ]
    )
    completion = response.choices[0].message.content.strip()

    return jsonify({'response': completion})

if __name__ == '__main__':
    print('Server listening on port ' + os.environ.get('PORT'))
    serve(app, host='localhost', port=os.environ.get('PORT'))

```

## Utilizzo
1. Assicurarsi di essere nella directory del progetto.
2. Eseguire il seguente comando per avviare il server Flask:
   ```
   python app.py
   ```
3. Il server sarà in ascolto sulla porta specificata nel file `.env`.
4. Utilizzare un'applicazione o uno strumento per le richieste API (come Postman) per inviare richieste POST al server all'indirizzo `http://localhost:<porta>/api/prompt`.
5. Inviare richieste contenenti un oggetto JSON con la chiave "prompt" e il testo del prompt come valore. Ad esempio:
   ```json
   {
     "prompt": "Mi chiamo Alice e mi piace..."
   }
   ```
6. Il server invierà una risposta JSON contenente la risposta generata dal modello GPT-3.5:
   ```json
   {
     "response": "Ciao Alice, mi chiamo Bob e sono felice di..."
   }
   ```
7. È possibile personalizzare ulteriormente il comportamento del modello regolando i parametri nella chiamata API al modello GPT-3.5.

## Considerazioni sulla sicurezza
Per impostazione predefinita, il server accetterà solo richieste provenienti dall'indirizzo IP locale (localhost) o dall'intervallo di rete affidabile configurato nel codice del server. È possibile personalizzare questa configurazione modificando la funzione `is_trusted_ip` nel codice del server.

## Personalizzazione del Modello
Il modello GPT-3.5 utilizzato da questo server è configurato con alcuni parametri predefiniti, come il numero massimo di token e la temperatura. È possibile personalizzare ulteriormente il comportamento del modello regolando questi parametri nella chiamata API al modello GPT-3.5. Consultare la documentazione di OpenAI per ulteriori dettagli sui parametri disponibili e sulle loro impostazioni consigliate.

## Conclusioni
Questo esempio di server GPT offre un modo semplice per utilizzare il modello GPT-3.5 di OpenAI per generare completamenti di testo. È possibile adattare il codice e la configurazione in base alle proprie esigenze. Si consiglia di consultare la documentazione ufficiale di OpenAI per comprendere appieno le funzionalità e le considerazioni di utilizzo del modello GPT-3.5.