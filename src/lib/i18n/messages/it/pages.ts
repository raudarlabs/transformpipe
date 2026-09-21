import type { Content } from '../../content';

/*
 * The words of the five pages that are only words, in Italian: about, contact, and the legal three.
 *
 * The legal three are policy, and this is a translation of them and nothing else: same sections in
 * the same order, same number of paragraphs, same number of list items, nothing softened, nothing
 * added. The line about which language version prevails is an interface string the application
 * renders; it is deliberately not here.
 */

export const pages: Content['pages'] = {
  about: {
    label: 'Chi siamo',
    title: 'Che cos’è TransformPipe',
    lede: 'Un convertitore di documenti che fa il lavoro nel tuo browser e per il resto non ti sta fra i piedi.',
    sections: [
      {
        heading: 'Che cosa fa',
        body: [
          'Quindici conversioni. Un file Word, una presentazione, un foglio di calcolo, un libro EPUB, un file OpenDocument o in testo formattato, un export di Evernote, una pagina HTML salvata, un CSV, una risposta JSON, o lo zip che Notion, Confluence e Obsidian consegnano quando esporti: ognuno diventa Markdown. E il Markdown diventa una pagina HTML finita, un file Word, testo semplice o qualcosa da stampare.',
          'Tutto si normalizza in Markdown, perché il Markdown è un formato che si legge senza lo strumento che l’ha prodotto, si confronta in una pull request e fra vent’anni si aprirà ancora.',
        ],
      },
      {
        heading: 'Gira nel tuo browser',
        body: [
          'Senza accesso, nessun file viene mandato da nessuna parte. Non c’è un caricamento di cui fidarsi perché non c’è alcun caricamento: la conversione avviene sulla tua macchina, ed è per questo che una pagina dietro l’accesso aziendale si converte con la stessa facilità di una pubblica.',
          'Fai l’accesso e il Markdown resta nel tuo account, così un documento ti segue su un’altra macchina. Resta privato finché non lo condividi, e un link condiviso si può revocare.',
        ],
      },
      {
        heading: 'Quello che esce è un file solo',
        body: [
          'L’HTML esportato porta dentro di sé stili, immagini, diagrammi e formule. Non chiede nulla alla rete, ed è esattamente questo che gli permette di aprirsi fra cinque anni su un portatile senza connessione come si apre oggi, e di essere spedito a qualcuno che lo aprirà una volta e non ci penserà mai più.',
        ],
      },
      {
        heading: 'E non solo nel browser',
        body: [
          'Le stesse conversioni arrivano a un terminale, a una pull request, a una scheda del browser e a una conversazione: un’API pubblica, un client da riga di comando senza dipendenze, una GitHub Action che pubblica il Markdown modificato da una pull request, un’estensione che converte la pagina che stai leggendo, e un server MCP perché un assistente converta e condivida per tuo conto. Dietro a tutto un unico insieme di convertitori, così una tabella esce uguale da qualunque parte tu l’abbia chiesta.',
        ],
      },
      {
        heading: 'Chi lo costruisce',
        body: [
          'TransformPipe è costruito da Raudar Labs. Il codice è pubblico e con licenza MIT, quindi la conversione di cui ti fidi è una che puoi leggere.',
        ],
      },
    ],
    seo: {
      title: 'Che cos’è TransformPipe — un convertitore che gira nel browser',
      description:
        'TransformPipe converte quindici formati in Markdown e viceversa, nel browser e senza caricare nulla. Più API, CLI, GitHub Action, estensione e server MCP.',
    },
  },
  support: {
    label: 'Assistenza',
    title: 'Assistenza',
    lede: 'Un bug, un formato che ti manca, o qualcosa che non dovrebbe essere pubblicato.',
    sections: [
      {
        heading: 'Un file convertito male',
        body: [
          'È la cosa più utile che puoi mandare. Allegalo alla segnalazione se puoi condividerlo, di’ che cosa ti aspettavi e indica il browser se altrove veniva giusto. Una conversione sbagliata su un file di solito è sbagliata su una forma, e il file è il modo per arrivare a quella forma.',
          'Un formato che non convertiamo ancora è una richiesta che vale la pena fare. Diversi di quelli che ci sono sono nati così.',
        ],
      },
      {
        heading: 'Qualcosa di condiviso che non dovrebbe esserlo',
        body: [
          'Ogni documento condiviso porta in fondo alla pagina che apre un link «Report this document». È la strada più rapida: identifica il documento senza che tu debba descriverlo e non richiede un account.',
        ],
      },
      {
        heading: 'Privacy e questioni legali',
        body: [
          'Le domande su che cosa viene conservato, o la richiesta di cancellare un account e tutto quello che contiene, vanno alle stesse segnalazioni. Con l’accesso fatto puoi anche cancellare da solo qualsiasi documento: questo rimuove la riga e la sorgente salvata insieme.',
        ],
      },
    ],
    seo: {
      title: 'Assistenza — TransformPipe',
      description:
        'Segnala un bug, chiedi un formato, segnala un documento condiviso, o chiedi che cosa viene conservato e fallo cancellare. Una segnalazione in due campi.',
    },
  },
  extension: {
    label: 'Estensione per il browser',
    title: 'L’estensione per il browser',
    lede: 'La pagina su cui sei, in Markdown, senza lasciarla.',
    sections: [
      {
        heading: 'Un clic e la pagina è un documento',
        body: [
          'Premi il pulsante nella barra degli strumenti: l’estensione legge la pagina che stai guardando, estrae l’articolo dalla navigazione e dagli avvisi sui cookie, rende assoluto ogni indirizzo di link e immagine e restituisce Markdown. Copialo, scaricalo, oppure salva la pagina come file `.html` autonomo, con il suo design e le sue immagini dentro il file e senza una sola richiesta.',
        ],
      },
      {
        heading: 'Le pagine che non hanno un export',
        body: [
          'Documentazione, un wiki, un ticket, un thread: tutto ciò che esiste solo renderizzato. Legge quello che il browser ha già a schermo, quindi anche una pagina che vedi solo tu si converte senza che nessuno consegni una password: Confluence, Jira e Notion non richiedono amministratore, export né token API.',
        ],
      },
      {
        heading: 'Due modi per tenerla aperta',
        body: [
          'Il pulsante apre un pannello compatto sopra la pagina. Il pannello laterale è la stessa cosa tenuta aperta di fianco: ti segue di scheda in scheda e converte ogni pagina appena arrivi — quello che serve quando ne stai attraversando una serie invece di convertirne una. Il menu contestuale converte una selezione.',
        ],
      },
      {
        heading: 'Anche i file, senza caricarli',
        body: [
          'Le stesse dieci conversioni del sito — Word, PDF, fogli di calcolo, HTML, CSV, JSON, EPUB e le altre — girano dentro l’estensione. Niente viene caricato e niente richiede una connessione, e più file scelti insieme diventano un solo documento, nell’ordine in cui li hai scelti.',
        ],
      },
      {
        heading: 'Quello che non fa',
        body: [
          'I permessi che chiede sono il gruppo più piccolo che basti al lavoro, e il più ampio fra loro è facoltativo:',
        ],
        items: [
          'Senza accesso non parla affatto con noi. La conversione avviene nella pagina, sul tuo computer.',
          'Non contiene analitica, né telemetria, né traccia delle pagine che hai convertito.',
          'Legge una pagina solo quando premi il suo pulsante o apri il pannello laterale su di essa, e non scrive mai nella pagina.',
          'Leggere la scheda attiva viene concesso quando attivi il pannello laterale; rifiutarlo costa il pannello e nient’altro.',
        ],
      },
      {
        heading: 'Con un account',
        body: [
          'Accedi — lo stesso account del sito, un clic, nessuna chiave da incollare — e Salva mette il documento dove stanno gli altri. Condividi pubblica un link, oppure nomina le persone che possono leggerlo; vengono avvisate per email e lo leggono con il proprio accesso.',
        ],
      },
      {
        heading: 'Installarla',
        body: [
          'Chrome la prende dal Chrome Web Store, e così i browser costruiti su Chromium: Edge, Brave, Opera, Arc. All’installazione non chiede alcun permesso sui siti — finché non colleghi un account non ha motivo di parlare con noi — e il pannello laterale chiede ciò che gli serve nel momento in cui lo attivi.',
        ],
      },
    ],
    action: 'Aggiungila a Chrome',
    seo: {
      title: 'Estensione per il browser — TransformPipe',
      description:
        'Converti in un clic in Markdown la pagina su cui sei, o un file del tuo computer: nel browser, offline e senza account.',
    },
  },
  privacy: {
    label: 'Privacy',
    title: 'Privacy',
    lede: 'Cosa viene conservato, dove, e cosa non viene raccolto affatto.',
    sections: [
      {
        heading: 'Senza accesso, a noi non arriva niente',
        body: [
          'La conversione avviene nel browser. Il file viene letto, convertito e mostrato sulla tua macchina, e nessuna sua parte viene inviata a un server. La cronologia che vedi è la memoria del browser, non un account.',
        ],
      },
      {
        heading: 'Con l’accesso, questo e nient’altro',
        body: [
          'Un account esiste perché i documenti possano seguirti tra i dispositivi ed essere condivisi. Contiene:',
        ],
        items: [
          'La tua identità, tramite il nostro fornitore di autenticazione: un indirizzo email, un nome quando ne è stato dato uno e un id dell’account. Con l’accesso tramite Google arrivano da Google; con la registrazione tramite indirizzo e password, la password resta presso il fornitore di autenticazione, come hash. In nessuno dei due casi vediamo o conserviamo una password.',
          'Per ogni documento conservato: il suo nome, quale conversione l’ha prodotto, la sua dimensione, il conteggio di parole, titoli, link, blocchi di codice, tabelle e immagini, e quando è stato creato.',
          'Il Markdown stesso, in un archivio blob privato — privato nel senso che non ha alcun URL pubblico e viene letto solo tramite una richiesta che autorizziamo noi.',
          'Le chiavi API come hash, mai la chiave. Una chiave viene mostrata una volta sola, alla creazione, e in seguito non è più recuperabile: né da te né da noi.',
          'Le impostazioni di condivisione: se un documento è privato, aperto per link o indirizzato a determinati indirizzi email, e il token che un link porta con sé.',
        ],
      },
      {
        heading: 'L’estensione per il browser',
        body: [
          'L’estensione converte la pagina su cui ti trovi, dentro quella pagina e sul tuo computer. Legge una pagina solo dopo che premi il suo pulsante o apri il pannello laterale su di essa, non scrive mai nella pagina, e nulla della pagina va da nessuna parte finché non premi Salva o Condividi: senza aver eseguito l’accesso non parla affatto con noi.',
        ],
        items: [
          'Dalla tua navigazione non viene raccolto nulla. Nell’estensione non c’è analitica né telemetria, e da nessuna parte resta traccia delle pagine che hai convertito.',
          'Con l’accesso fatto, un token OAuth resta nella memoria delle estensioni del browser: la stessa autorizzazione elencata nella pagina del tuo account e revocabile lì. È l’unica credenziale che l’estensione conserva e non contiene alcuna password.',
          'Un documento convertito passa dal pannello alla scheda che lo mostra attraverso la memoria di sessione, che il browser svuota alla chiusura e non scrive mai su disco.',
          'Leggere la scheda su cui ti trovi viene chiesto quando attivi il pannello laterale, perché un pannello che ti segue di scheda in scheda non può chiedere di nuovo a ognuna. Il pulsante nella barra degli strumenti non ne ha bisogno: legge la sola scheda su cui l’hai premuto.',
          'Salva e Condividi inviano quel solo documento al tuo account, esattamente come fa l’app. Nient’altro lascia il browser.',
        ],
      },
      {
        heading: 'Cosa non facciamo',
        body: [
          'Non c’è pubblicità, non c’è nessun pixel di tracciamento e niente viene venduto. Si carica un solo script di terze parti — Google Tag Manager — e porta con sé Google Analytics soltanto se lo hai consentito nel banner dei cookie; se lo rifiuti o non rispondi, i tag di Google non scrivono nulla nel browser. Niente viene condiviso con nessuno tranne l’infrastruttura che fa funzionare il servizio: il database, l’archivio blob, il fornitore di autenticazione, il fornitore di e-mail e l’hosting.',
          'I tuoi documenti non vengono letti da noi, e non vengono usati per addestrare niente.',
        ],
      },
      {
        heading: 'Le e-mail',
        body: [
          'Un’e-mail parte in quattro casi e in nessun altro: per confermare il tuo indirizzo, per reimpostare una password, per darti il benvenuto una volta dopo la registrazione e per avvisare qualcuno che un documento è stato condiviso con lui. I primi due li invia il fornitore di autenticazione, gli altri due il fornitore di e-mail. Non c’è nessuna newsletter, e non c’è niente da cui disiscriversi.',
          'Al fornitore di e-mail vengono dati l’indirizzo del destinatario, quello di chi condivide quando c’è, e il messaggio stesso. Un documento non gli viene mai dato.',
        ],
      },
      {
        heading: 'Cookie e memoria del browser',
        body: [
          'Un solo cookie di sessione, impostato dal nostro fornitore di autenticazione al momento dell’accesso, di prima parte e HttpOnly. Durante il giro di andata e ritorno dell’accesso esiste un cookie di breve durata, che scade in dieci minuti. Sono tutti qui — non c’è niente di opzionale da disattivare. La pagina sui cookie ha i dettagli.',
          'Il tema e, senza accesso, la cronologia vivono nella memoria locale del browser. Non la lasciano mai.',
        ],
      },
      {
        heading: 'Eliminare le cose',
        body: [
          'Eliminare un documento elimina insieme la riga e il Markdown conservato, subito, non secondo una pianificazione. Revocare una condivisione elimina il token, così un link già inviato smette di funzionare.',
          'Per rimuovere un account e tutto quello che contiene, basta chiederlo — vedi la pagina di assistenza. Raggiungere un limite di spazio rifiuta la scrittura; non elimina mai qualcosa che hai scelto di conservare per fare spazio.',
        ],
      },
      {
        heading: 'Minori',
        body: [
          'Questo è uno strumento di lavoro, non un servizio per bambini, e non è rivolto a nessuno sotto i 16 anni.',
        ],
      },
      {
        heading: 'Modifiche',
        body: [
          'Se questa pagina cambia in un modo che riguarda ciò che viene raccolto, la data qui sopra cambia con lei.',
        ],
      },
    ],
    seo: {
      title: 'Privacy — TransformPipe',
      description:
        'Senza accesso nessun file lascia il browser. Con l’accesso: documento, metadati e identità dell’account. Statistiche solo se le consenti, nessun pixel di tracciamento, niente in vendita.',
    },
  },
  terms: {
    label: 'Termini',
    title: 'Termini di utilizzo',
    lede: 'La versione breve, perché una lunga non verrebbe letta.',
    sections: [
      {
        heading: 'Uso del servizio',
        body: [
          'TransformPipe è offerto gratuitamente, così com’è. Si può usare per qualunque cosa si abbia il diritto di convertire, dall’app, dall’API, dalla riga di comando o da un assistente.',
          'Un account è tuo da conservare o da eliminare. Sei responsabile di quello che fai con una chiave API, quindi trattala come una password: chiunque la abbia può leggere e scrivere i tuoi documenti.',
        ],
      },
      {
        heading: 'I tuoi documenti restano tuoi',
        body: [
          'Conservi tutti i diritti che avevi su un documento prima di convertirlo. Non rivendichiamo nessuna proprietà e nessuna licenza oltre a quanto serve per far funzionare il servizio: conservarlo perché tu possa riaprirlo, e mostrarlo alle persone con cui hai deliberatamente scelto di condividerlo.',
        ],
      },
      {
        heading: 'Cosa non mettere qui',
        body: [
          'Non usare il servizio per contenuti illegali, che non hai il diritto di distribuire, o che esistono per danneggiare qualcuno: malware, materiale che sfrutta sessualmente i minori, molestie mirate. Non usare un link di condivisione per far girare una pagina di phishing.',
          'I documenti condivisi possono essere segnalati da chiunque li apra. Un documento che viola questa sezione può essere ritirato dalla pubblicazione o eliminato, e un account che ripete può essere chiuso.',
        ],
      },
      {
        heading: 'Limiti e disponibilità',
        body: [
          'Si applicano limiti di frequenza e di spazio, pubblicati nella documentazione. Esistono per tenere in piedi il servizio, e possono cambiare.',
          'Non c’è nessuna promessa di continuità. Il servizio può essere interrotto, e le funzioni possono cambiare o essere ritirate. Tieni una copia tua di tutto quello che non puoi perdere — il download esiste esattamente per questo, e per aprirlo non serve niente da parte nostra.',
        ],
      },
      {
        heading: 'Nessuna garanzia, e il limite di ciò che dobbiamo',
        body: [
          'Il servizio è fornito senza garanzie di alcun tipo, esplicite o implicite. Nella misura massima consentita dalla legge, Raudar Labs non è responsabile per perdita di dati, perdita di profitto, o qualsiasi danno indiretto o consequenziale derivante dal suo utilizzo.',
          'Niente di quanto scritto qui limita un diritto che non può essere limitato per accordo.',
        ],
      },
      {
        heading: 'Modifiche e conclusione',
        body: [
          'Questi termini possono cambiare; la data qui sopra dice quando è avvenuto l’ultima volta, e continuare a usare il servizio è il modo in cui vengono accettati. Puoi smettere in qualsiasi momento eliminando i tuoi documenti e il tuo account.',
        ],
      },
    ],
    seo: {
      title: 'Termini di utilizzo — TransformPipe',
      description:
        'TransformPipe è gratuito e fornito così com’è. I tuoi documenti restano tuoi, i limiti sono pubblicati, e non c’è nessuna garanzia.',
    },
  },
  cookies: {
    label: 'Cookie',
    title: 'Cookie',
    lede: 'Due servono per accedere. Una cosa è facoltativa — le statistiche — e resta spenta finché non la consenti.',
    sections: [
      {
        heading: 'L’unica cosa che scegli',
        body: [
          'La maggior parte delle pagine sui cookie esiste per permettere di rifiutare analisi statistiche e pubblicità. Qui non c’è alcuna pubblicità. Le statistiche sono Google Analytics, caricato tramite Google Tag Manager, e sono l’unico interruttore del sito: il banner chiede alla prima visita, il pulsante in fondo a questa pagina riapre la risposta, e finché non le consenti i tag di Google non scrivono nulla nel browser e inviano al massimo ping senza cookie.',
          'Senza accesso, e con le statistiche rifiutate o senza risposta, questo sito non imposta alcun cookie.',
        ],
      },
      {
        heading: 'I due che esistono',
        body: [
          'Entrambi sono impostati dal nostro fornitore di autenticazione, sono di prima parte e sono contrassegnati HttpOnly e Secure — lo script della pagina non può leggerli:',
        ],
        items: [
          '__Secure-neon-auth.session_token — ti mantiene autenticato. Senza di esso, ogni caricamento di pagina chiederebbe di accedere di nuovo. Se ne va quando esci.',
          '__Secure-neon-auth.session_challenge — esiste per i dieci minuti del giro di andata e ritorno dell’accesso, così la risposta di Google può essere abbinata alla richiesta che l’ha avviata. È ciò che impedisce che l’accesso di qualcun altro finisca nella tua sessione.',
        ],
      },
      {
        heading: 'La memoria del browser, che non è un cookie',
        body: [
          'Due cose vivono nella memoria locale del browser e non vengono mai inviate da nessuna parte: il tema che hai scelto e — quando non hai effettuato l’accesso — le tue conversioni recenti, così la cronologia ha qualcosa dentro. Cancellando i dati del sito dal browser si rimuovono entrambe, e l’app va avanti senza di loro.',
        ],
      },
      {
        heading: 'Se questo cambia',
        body: [
          'Se mai venisse aggiunto qualcosa di opzionale, questa pagina avrà un vero controllo prima che venga impostato, non dopo. La data qui sopra dirà quando.',
        ],
      },
    ],
    seo: {
      title: 'Cookie — TransformPipe',
      description:
        'Due cookie di sessione di prima parte, entrambi necessari per accedere. Nessuna analisi, nessuna pubblicità, niente di opzionale da configurare.',
    },
  },

  /*
   * Le pagine di istruzioni: una per ogni estensione che l’area di trascinamento accetta.
   *
   * Rispondono invece di argomentare, ed è questo che le separa dal blog. Qualcuno ha un file e
   * nessuna idea di cosa lo apra; ha cercato l’estensione; vuole la risposta nel primo paragrafo e
   * in fondo una via d’uscita dal problema. Quindi: che cos’è la cosa, cosa la apre su ciascun tipo
   * di macchina, cosa va storto, e la conversione che chiude la domanda.
   */
  'how-to-md': {
    label: 'Aprire un file .md',
    title: 'Come aprire un file .md',
    lede: 'Un file Markdown è testo semplice. Tutto ciò che apre il testo lo apre — la domanda è cosa lo fa sembrare un documento.',
    sections: [
      {
        heading: 'Che cos’è',
        body: [
          'Un file `.md` è un file di testo con dentro qualche convenzione: un cancelletto per un titolo, gli asterischi per l’enfasi, un trattino per un elenco. Niente nel file è binario e niente è compresso, quindi un editor di testo ne mostra subito tutta la verità.',
          'È anche per questo che sembra incompiuto. Le convenzioni sono istruzioni per un renderer, e finché qualcosa non le interpreta stai leggendo le istruzioni invece del documento.',
        ],
      },
      {
        heading: 'Su un computer',
        body: [
          'Su Windows lo apre Notepad e ne mostra il testo grezzo. Su un Mac fa lo stesso TextEdit, anche se può chiedere prima di convertire il file — rifiuta, e resta semplice. Su entrambi, VS Code mostra un’anteprima dal vivo accanto al sorgente, che è la cosa più vicina alla pagina finita senza uscire dall’editor.',
          'Trascinare il file su una finestra del browser non funziona come la gente si aspetta: il browser mostra il testo grezzo o propone di scaricarlo, perché nessun browser interpreta il Markdown da sé.',
        ],
      },
      {
        heading: 'Su un telefono',
        body: [
          'La maggior parte dei telefoni non ha un lettore Markdown installato e proporrà di aprire il file in un’app di note o di file, che mostra il testo così com’è scritto. Su iOS, File lo mostra in anteprima come testo semplice; su Android il comportamento dipende da quale editor di testo è installato.',
          'Convertirlo prima in HTML è di solito più rapido che trovare un lettore, perché ogni telefono ha già un browser e ogni browser apre l’HTML.',
        ],
      },
      {
        heading: 'Cosa va storto di solito',
        body: [
          'Un file salvato come `notes.md.txt` da un editor di testo che ha aggiunto la propria estensione non verrà riconosciuto da niente che cerchi del Markdown. Rinominalo e il problema sparisce.',
          'Tabelle, note a piè di pagina ed elenchi di attività non sono nella specifica originale del Markdown, quindi un lettore che mostra alla lettera le barre verticali e le parentesi non è rotto: implementa il nucleo e non le estensioni.',
        ],
      },
    ],
    action: 'Convertire un file .md in HTML',
    seo: {
      title: 'Come aprire un file .md — TransformPipe',
      description:
        'Che cos’è un file Markdown, cosa lo apre su Windows, macOS e telefono, perché il browser mostra il testo grezzo e come farne una pagina leggibile.',
    },
  },
  'how-to-html': {
    label: 'Aprire un file .html',
    title: 'Come aprire un file .html',
    lede: 'Lo apre qualsiasi browser. La domanda interessante è cosa fare quando si vogliono le parole invece della pagina.',
    sections: [
      {
        heading: 'Che cos’è',
        body: [
          'Un file `.html` è la pagina stessa: il testo, e il markup che dice quale parte è un titolo, un link, una tabella. Può anche fare riferimento a stili, immagini e script che stanno altrove, ed è per questo che una pagina salvata a volte si apre senza sembrare niente.',
        ],
      },
      {
        heading: 'Aprirlo',
        body: [
          'Il doppio clic lo apre nel browser predefinito su ogni sistema desktop. Se invece si apre in un editor, fai clic con il tasto destro e scegli «Apri con», poi un browser.',
          'Su un telefono, un gestore di file di solito lo passa al browser. Se si rifiuta, mandarsi il file per e-mail e aprire l’allegato di norma funziona, perché i client di posta passano l’HTML a una vista web.',
        ],
      },
      {
        heading: 'Quando si apre vuoto o senza stili',
        body: [
          'Una pagina salvata con «Salva con nome, Pagina web completa» tiene gli stili e le immagini in una cartella accanto al file. Sposta il file senza la cartella e la pagina perde tutto tranne il testo.',
          'Una pagina salvata come file unico tiene tutto dentro di sé e si apre allo stesso modo ovunque. È per questo che un’esportazione che vale la pena conservare è un’esportazione autonoma.',
        ],
      },
      {
        heading: 'Tirarne fuori il testo',
        body: [
          'Copiare dal browser dà le parole e perde la struttura: i titoli diventano righe qualunque, le tabelle diventano sequenze di testo. Convertire il file in Markdown conserva la struttura in una forma leggibile e modificabile, che di solito è quello che si voleva davvero.',
        ],
      },
    ],
    action: 'Convertire un file .html in Markdown',
    seo: {
      title: 'Come aprire un file .html — TransformPipe',
      description:
        'Come aprire un file HTML su un computer o un telefono, perché una pagina salvata a volte perde lo stile e come tirarne fuori il testo con la struttura intatta.',
    },
  },
  'how-to-docx': {
    label: 'Aprire un file .docx',
    title: 'Come aprire un file .docx',
    lede: 'Un .docx è un archivio zip di XML. Lo apre Word, e lo aprono anche diverse cose gratuite.',
    sections: [
      {
        heading: 'Che cos’è',
        body: [
          'Un `.docx` non è un documento unico ma una cartella compressa: rinominalo in `.zip` e potrai aprirlo per trovarci dentro il testo, gli stili e le immagini come file separati. Questo è il formato, ed è il motivo per cui un `.docx` non si può leggere in modo utile in un editor di testo.',
        ],
      },
      {
        heading: 'Senza comprare Word',
        body: [
          'Google Docs apre un `.docx` caricandolo su Drive, LibreOffice Writer lo apre su qualsiasi sistema desktop ed è gratuito, e sia Apple Pages sia la versione web di Word di Microsoft ne aprono uno senza licenza a pagamento.',
          'Su un telefono, l’app Word apre i file `.docx` in lettura senza abbonamento; la modifica è dove comincia il muro a pagamento.',
        ],
      },
      {
        heading: 'Quando non si apre',
        body: [
          'Un file che arriva come `document.docx` ma si rifiuta di aprirsi in qualunque cosa è spesso un `.doc` — il formato più vecchio — con l’estensione sbagliata, oppure un file il cui scaricamento non è finito. Controlla prima la dimensione: un download troncato di solito è palesemente troppo piccolo.',
          'Un `.docx` protetto da password aprirà la finestra di dialogo e nient’altro. Nessun convertitore può superarla, ed è una proprietà del file più che un limite dello strumento.',
        ],
      },
      {
        heading: 'Tenere le parole, lasciare l’impaginazione',
        body: [
          'Convertire in Markdown conserva titoli, elenchi, link e tabelle e butta via caratteri, margini e interruzioni di pagina. Per un testo che deve vivere in un repository, in un wiki o in un diff, quello scambio è il punto e non una perdita.',
        ],
      },
    ],
    action: 'Convertire un file .docx in Markdown',
    seo: {
      title: 'Come aprire un file .docx — TransformPipe',
      description:
        'Che cos’è davvero un .docx, come aprirne uno senza comprare Word, cosa fare quando si rifiuta di aprirsi e come tenere il testo lasciando l’impaginazione.',
    },
  },
  'how-to-csv': {
    label: 'Aprire un file .csv',
    title: 'Come aprire un file .csv',
    lede: 'Lo apre un foglio di calcolo, un editor di testo mostra cosa c’è davvero dentro, e la differenza conta più di quanto sembri.',
    sections: [
      {
        heading: 'Che cos’è',
        body: [
          'Un `.csv` sono righe di testo con un separatore tra i campi — di solito una virgola, a volte un punto e virgola o una tabulazione. Non ci sono tipi, né formule, né formattazione: ogni valore è una stringa, e tutto ciò che sembra una data o un numero è il tuo software che tira a indovinare.',
        ],
      },
      {
        heading: 'Aprirlo',
        body: [
          'Il doppio clic lo apre in Excel o in Numbers sulla maggior parte delle macchine, e in LibreOffice Calc se è installato. Google Sheets ne importa uno da «File, Importa».',
          'Aprirlo prima in un editor di testo vale i dieci secondi che costa: mostra il separatore vero, se la prima riga è un’intestazione e se i campi sono tra virgolette — tre cose che un foglio di calcolo decide per te in silenzio.',
        ],
      },
      {
        heading: 'Quando le colonne vengono fuori sbagliate',
        body: [
          'Se finisce tutto in una colonna, il separatore usato dal tuo file non è quello che il foglio di calcolo si aspettava. In Excel usa «Dati, Da testo/CSV» invece del doppio clic, e imposta tu il delimitatore.',
          'Se i caratteri accentati escono come sciocchezze, le codifiche non coincidono: il file è UTF-8 e il programma ha ipotizzato qualcos’altro. La stessa finestra di importazione ti permette di dirlo.',
          'Gli zeri iniziali che spariscono da codici postali o codici articolo non sono recuperabili dopo il fatto — il foglio di calcolo ha convertito il valore in un numero all’apertura. Importa invece la colonna come testo.',
        ],
      },
      {
        heading: 'Metterlo in un documento',
        body: [
          'Incollare un intervallo di foglio di calcolo in un documento dà o l’immagine di una tabella o un pasticcio, a seconda di dove lo si incolla. Convertire il file in una tabella Markdown dà righe che sopravvivono a una copia, a un diff e a una pull request.',
        ],
      },
    ],
    action: 'Convertire un file .csv in una tabella Markdown',
    seo: {
      title: 'Come aprire un file .csv — TransformPipe',
      description:
        'Come aprire un CSV, perché a volte le colonne collassano in una sola, cosa rovina gli zeri iniziali e i caratteri accentati, e come farne una tabella.',
    },
  },
  'how-to-json': {
    label: 'Aprire un file .json',
    title: 'Come aprire un file .json',
    lede: 'È testo, quindi lo apre tutto. È la lettura la parte che ha bisogno di aiuto.',
    sections: [
      {
        heading: 'Che cos’è',
        body: [
          'Un file `.json` contiene dati strutturati: oggetti con campi denominati, elenchi di cose, numeri e stringhe. È il formato in cui risponde un’API e quello in cui la maggior parte delle applicazioni esporta le proprie impostazioni, ed è per questo che ne compare uno in una cartella dei download senza spiegazioni.',
        ],
      },
      {
        heading: 'Aprirlo',
        body: [
          'Trascinarlo in una finestra del browser funziona bene: Firefox e Chrome mostrano entrambi una vista pieghevole e ricercabile invece del testo grezzo. VS Code lo apre con le pieghe e riformatta con un solo comando un file scritto su una riga sola.',
          'Un’esportazione molto grande — decine di megabyte — metterà in difficoltà un editor. Uno strumento da riga di comando come `jq` le legge senza caricare tutto il file in una finestra.',
        ],
      },
      {
        heading: 'Quando non viene analizzato',
        body: [
          'I tre difetti soliti sono una virgola in coda dopo l’ultimo elemento, gli apici singoli dove il formato vuole quelli doppi, e un commento — il JSON non ha commenti, qualunque aspetto avesse il file da cui è arrivato.',
          'Un errore che indica una riga e una colonna merita fiducia: il parser si è fermato esattamente lì, e il difetto di solito è un carattere prima.',
        ],
      },
      {
        heading: 'Renderlo leggibile da una persona',
        body: [
          'Una vista pieghevole serve a ispezionare i dati. Quando lo scopo è mostrarli a qualcuno, la conversione in Markdown trasforma un elenco di record in una tabella e gli oggetti annidati in sezioni con un titolo — le stesse informazioni, in una forma che sopravvive all’essere incollata in un documento.',
        ],
      },
    ],
    action: 'Convertire un file .json in Markdown',
    seo: {
      title: 'Come aprire un file .json — TransformPipe',
      description:
        'Come aprire e leggere un file JSON in un browser o in un editor, le tre cose che di solito rompono l’analisi e come trasformarne uno in qualcosa di leggibile.',
    },
  },
  'how-to-txt': {
    label: 'Aprire un file .txt',
    title: 'Come aprire un file .txt',
    lede: 'Niente si apre più facilmente. I problemi cominciano quando il testo è stato scritto su un altro tipo di macchina.',
    sections: [
      {
        heading: 'Che cos’è',
        body: [
          'Un file `.txt` è fatto di caratteri e di interruzioni di riga, senza niente che descriva come debba apparire. È questa la sua virtù: si apre su ogni sistema mai costruito e si aprirà ancora fra trent’anni.',
        ],
      },
      {
        heading: 'Aprirlo',
        body: [
          'Ogni sistema operativo ha un editor che lo apre con un doppio clic — Notepad, TextEdit, gedit. Un browser ne apre uno trascinato sulla sua finestra. Un telefono lo mostra in anteprima nella sua app dei file.',
        ],
      },
      {
        heading: 'Quando si apre come un’unica riga lunga, o come quadratini',
        body: [
          'Il testo scritto su Windows termina le righe con due caratteri, quello scritto su Unix con uno. Gli editor più vecchi, che si aspettano l’altra convenzione, mostrano il file come un’unica riga continua, oppure disegnano un quadratino a ogni interruzione. Qualsiasi editor moderno gestisce entrambe; Notepad dal 2018.',
          'Caratteri senza senso dove dovrebbero esserci accenti o virgolette sono una codifica che non coincide — il file è UTF-8 e l’editor ha ipotizzato una vecchia codifica a un byte. Quasi tutti gli editor permettono di riaprirlo con una codifica indicata da te.',
        ],
      },
      {
        heading: 'Quando deve diventare un documento',
        body: [
          'Trattare il testo semplice come Markdown sembra funzionare finché una riga che inizia con un trattino non diventa un punto elenco, un asterisco dentro una frase non rende corsivo mezzo paragrafo e un anno a inizio riga non diventa un elenco numerato. Convertirlo come si deve protegge prima quei caratteri, così quello che diceva il file è quello che dice la pagina.',
        ],
      },
    ],
    action: 'Convertire un file .txt in Markdown',
    seo: {
      title: 'Come aprire un file .txt — TransformPipe',
      description:
        'Come aprire ovunque un file di testo, perché a volte appare come un’unica riga o come quadratini, e come farne un documento senza formattazione aggiunta.',
    },
  },
  'how-to-xlsx': {
    label: 'Aprire un file .xlsx',
    title: 'Come aprire un file .xlsx',
    lede: 'Excel non è l’unica cosa che ne apre uno, e per leggere un foglio raramente è la più rapida.',
    sections: [
      {
        heading: 'Che cos’è',
        body: [
          'Un `.xlsx` è un archivio zip di XML, costruito come un `.docx`: fogli, stili e stringhe condivise come file separati dentro un’unica cartella compressa. Contiene tipi, formule, formattazione e più fogli insieme, cioè tutto quello che un CSV non può.',
        ],
      },
      {
        heading: 'Senza comprare Excel',
        body: [
          'Google Sheets ne importa uno da «File, Importa». LibreOffice Calc lo apre su qualsiasi sistema desktop ed è gratuito. Apple Numbers ne apre uno su un Mac, e la versione web di Excel di Microsoft ne legge uno senza licenza a pagamento.',
        ],
      },
      {
        heading: 'Cosa controllare prima di fidarsi dei numeri',
        body: [
          'Una cella che mostra `####` è una colonna troppo stretta per visualizzare il valore, non un file rotto. Una data che si legge come un numero di cinque cifre è il valore seriale sottostante a cui è andata persa la formattazione.',
          'Le formule vengono conservate accanto al loro ultimo risultato calcolato. Un file aperto in qualcosa che non le valuta mostra i risultati, che sono corretti al momento dell’ultimo salvataggio del file e non necessariamente adesso.',
        ],
      },
      {
        heading: 'Portare un foglio in un documento',
        body: [
          'La via abituale è esportare ogni foglio in CSV e convertire quello, il che perde tutto tranne il foglio attivo. Convertire direttamente la cartella di lavoro dà una tabella Markdown per foglio, con un indice quando ce n’è più di uno.',
        ],
      },
    ],
    action: 'Convertire un file .xlsx in tabelle Markdown',
    seo: {
      title: 'Come aprire un file .xlsx — TransformPipe',
      description:
        'Come aprire una cartella di lavoro Excel senza comprare Excel, cosa significano davvero #### e le date a cinque cifre, e come fare di ogni foglio una tabella.',
    },
  },
  'how-to-pptx': {
    label: 'Aprire un file .pptx',
    title: 'Come aprire un file .pptx',
    lede: 'Aprirlo è facile. Leggerlo senza aver assistito alla presentazione è la parte in cui nulla aiuta.',
    sections: [
      {
        heading: 'Che cos’è',
        body: [
          'Un `.pptx` è un archivio zip di XML, costruito come un `.docx` o un `.xlsx`: un file per diapositiva, uno per pagina di note e le immagini accanto. Il vecchio `.ppt` è tutt’altro — un formato binario precedente al 2007, che quasi tutto ciò che apre un `.pptx` sa comunque convertire.',
        ],
      },
      {
        heading: 'Senza comprare PowerPoint',
        body: [
          'Google Slides lo importa da File, Apri. LibreOffice Impress lo apre su qualsiasi sistema desktop ed è gratuito. Keynote lo apre su un Mac, e la versione web di PowerPoint lo legge senza licenza a pagamento.',
          'Su un Mac basta premere la barra spaziatrice sul file nel Finder per vedere tutte le diapositive senza aprire nulla.',
        ],
      },
      {
        heading: 'Dove sono le note del relatore',
        body: [
          'Sotto la diapositiva, in un riquadro che la maggior parte dei programmi tiene nascosto: Visualizza, poi Note, sia in PowerPoint sia in Google Slides. È lì che il ragionamento sta scritto per esteso, mentre la diapositiva sopra è solo il riassunto che qualcuno ha letto ad alta voce.',
          'L’esportazione in PDF le elimina, a meno di scegliere il layout con le pagine delle note: ecco perché a una presentazione che gira in PDF manca così spesso la metà che la spiegava.',
        ],
      },
      {
        heading: 'Dalla presentazione al documento',
        body: [
          'Di solito si ricopia a mano il testo di ogni diapositiva, e così le note si perdono perché nel frattempo non sono nemmeno sullo schermo. Convertire il file direttamente dà una sezione per diapositiva, nell’ordine di presentazione, con elenchi, tabelle e note ancora attaccati alla diapositiva da cui vengono.',
        ],
      },
    ],
    action: 'Convertire un .pptx in Markdown',
    seo: {
      title: 'Come aprire un file .pptx — TransformPipe',
      description:
        'Come aprire un file PowerPoint senza PowerPoint, dove si nascondono le note del relatore e come trasformare un’intera presentazione in un documento leggibile.',
    },
  },
  'how-to-epub': {
    label: 'Aprire un file .epub',
    title: 'Come aprire un file .epub',
    lede: 'Qualsiasi lettore lo apre. È tirarne fuori il testo che diventa scomodo.',
    sections: [
      {
        heading: 'Che cos’è',
        body: [
          'Un `.epub` è un archivio zip di XHTML: una pagina web per capitolo, un foglio di stile, le immagini e un file di pacchetto che li elenca e stabilisce l’ordine di lettura. È il formato aperto su cui si è accordata tutta l’industria; gli `.azw3` e `.mobi` del Kindle sono l’eccezione, non lo standard.',
        ],
      },
      {
        heading: 'Per leggerlo',
        body: [
          'Apple Books lo apre su Mac, iPhone e iPad, e Microsoft Edge lo apre su Windows senza installare nulla. Calibre è il lettore desktop gratuito che converte anche fra formati, e Thorium è quello da scegliere se si vuole un sistema di lettura fedele alle specifiche.',
          'Un Kindle non legge l’`.epub` direttamente, ma il servizio «Invia a Kindle» di Amazon lo accetta e lo converte per strada.',
        ],
      },
      {
        heading: 'Perché rinominarlo in .zip quasi funziona',
        body: [
          'Perché lo è. Estrai un `.epub` e ogni capitolo è lì, apribile in un browser. Quello che non avrai è l’ordine: i file si chiamano spesso `index_split_030.xhtml`, `index_split_002.xhtml`, e quei numeri sono soltanto ciò che ha scritto lo strumento che ha prodotto il libro. L’ordine di lettura sta nella spine del file di pacchetto, e non lo dichiara nient’altro.',
        ],
      },
      {
        heading: 'Dal libro al documento',
        body: [
          'Convertirlo direttamente dà un documento Markdown: i capitoli nell’ordine della spine, sotto i titoli dell’indice del libro, con le immagini dentro il file e i rimandi fra capitoli ridotti alle loro parole, perché in un documento unito non hanno più dove atterrare.',
        ],
      },
    ],
    action: 'Convertire un .epub in Markdown',
    seo: {
      title: 'Come aprire un file .epub — TransformPipe',
      description:
        'Come aprire un EPUB su qualsiasi dispositivo, perché estraendolo si perde l’ordine dei capitoli e come trasformare un libro intero in un documento.',
    },
  },
  'how-to-odt': {
    label: 'Aprire un file .odt',
    title: 'Come aprire un file .odt',
    lede: 'È lo standard internazionale del documento di videoscrittura, e lo apre anche Word.',
    sections: [
      {
        heading: 'Che cos’è',
        body: [
          'Un `.odt` è uno zip di XML — `content.xml` per le parole, `styles.xml` per il loro aspetto, una cartella `Pictures` — ed è OpenDocument Text, uno standard ISO e non il formato di una sola azienda. LibreOffice e OpenOffice lo scrivono per impostazione predefinita, e Google Docs lo restituisce da File, Scarica.',
        ],
      },
      {
        heading: 'Per aprirlo',
        body: [
          'LibreOffice è la risposta ovvia ed è gratuito su qualsiasi sistema desktop. Microsoft Word apre e salva gli `.odt` dal 2007, e così Word sul web; Google Docs lo importa da File, Apri. Anche Apple Pages lo apre, ma vorrà risalvarlo in altro formato.',
          'Se ti serve solo leggerlo, lo zip è a tua disposizione: estrailo e `content.xml` è il documento, tag compresi.',
        ],
      },
      {
        heading: 'Che cosa va storto di solito',
        body: [
          'Il giro attraverso Word. Un `.odt` aperto in Word e risalvato mantiene le parole e perde parte della formattazione, perché i due programmi non concordano su che cosa significhi ogni stile — un problema solo se poi qualcuno lo riapre in LibreOffice.',
          'I caratteri, come per ogni formato di documento. Un file che nomina un carattere che non hai viene composto con quello che il lettore sostituisce, e un conteggio di pagine che contava smette di essere lo stesso.',
        ],
      },
      {
        heading: 'Dal documento al Markdown',
        body: [
          'È il formato che si converte più fedelmente di tutti, perché dice che cosa sono le cose invece di come appaiono: un’intestazione conosce il proprio livello, un elenco il proprio annidamento, una tabella è una tabella e una nota è una nota. Convertirlo conserva tutto questo, immagini dentro il file comprese.',
        ],
      },
    ],
    action: 'Convertire un .odt in Markdown',
    seo: {
      title: 'Come aprire un file .odt — TransformPipe',
      description:
        'Come aprire un file OpenDocument, quali programmi lo leggono oltre a LibreOffice, che cosa costa il giro attraverso Word e come farne Markdown.',
    },
  },
  'how-to-rtf': {
    label: 'Aprire un file .rtf',
    title: 'Come aprire un file .rtf',
    lede: 'Lo apre qualsiasi cosa. È esattamente il suo scopo, ed è il motivo per cui esiste ancora.',
    sections: [
      {
        heading: 'Che cos’è',
        body: [
          'Il Rich Text Format è testo semplice con dentro delle istruzioni: `{\\rtf1` all’inizio, poi parole di controllo come `\\b` per il grassetto e `\\par` per un nuovo paragrafo, fino in fondo. Microsoft lo pubblicò nel 1987 e smise di svilupparlo nel 2008, ed è proprio per questo che ogni programma di videoscrittura scritto da allora lo legge.',
        ],
      },
      {
        heading: 'Per aprirlo',
        body: [
          'TextEdit su Mac e WordPad su Windows lo aprono senza installare nulla, e così Word, LibreOffice, Google Docs e Pages. Su un Mac basta la barra spaziatrice nel Finder.',
          'Si legge anche così com’è: aprilo in un editor di testo e le parole sono lì fra le parole di controllo, il che è più di quanto si possa dire di un `.docx`.',
        ],
      },
      {
        heading: 'Perché arriva così spesso',
        body: [
          'Perché è quello che produce un Mac quando il testo esce da un’applicazione. Trascina una selezione da una finestra a un’altra e macOS consegna RTF; lo stesso vale per gran parte del copia e incolla fra programmi, e per tutto ciò che ha esportato un sistema più vecchio che voleva tenere grassetto e corsivo senza impegnarsi su un formato.',
          'Non porta quasi metadati né macro, ed è anche per questo che è la scelta prudente quando un documento esce dall’organizzazione.',
        ],
      },
      {
        heading: 'E in Markdown',
        body: [
          'Grassetto, corsivo, barrato, collegamenti, elenchi e tabelle si convertono. Le intestazioni sono l’unica cosa su cui il formato è vago: Word scrive un livello di struttura e lo intende davvero, un Mac non scrive altro che una riga in grassetto più grande — quindi si usa il livello di struttura dove c’è, e dove non c’è un paragrafo in grassetto composto più grande del corpo del testo.',
        ],
      },
    ],
    action: 'Convertire un .rtf in Markdown',
    seo: {
      title: 'Come aprire un file .rtf — TransformPipe',
      description:
        'Come aprire un file di testo formattato, perché un Mac ne produce uno quando trascini del testo, che cosa contiene e come trasformarlo in Markdown.',
    },
  },
  'how-to-enex': {
    label: 'Aprire un file .enex',
    title: 'Come aprire un file .enex',
    lede: 'È l’unica uscita delle note da Evernote, e quasi nulla lo apre direttamente.',
    sections: [
      {
        heading: 'Che cos’è',
        body: [
          'Un `.enex` è un unico file XML con tutte le note esportate: il titolo, i tag, le date e la nota stessa in ENML — la variante ristretta di XHTML propria di Evernote — annidata dentro l’XML. Gli allegati viaggiano nello stesso file, codificati in base64, collegati alla nota dall’MD5 del loro contenuto e non da un nome.',
        ],
      },
      {
        heading: 'Come ottenerne uno',
        body: [
          'Seleziona le note, o un taccuino intero, poi File, Esporta note. L’app desktop scrive `.enex`; la versione web non offre alcuna esportazione, quindi è un’operazione solo da desktop.',
          'Esporta un taccuino alla volta invece di tutto insieme. Un unico file da diecimila note è una cosa che può andare storta invece di venti.',
        ],
      },
      {
        heading: 'Che cosa lo legge',
        body: [
          'Il plugin Importer di Obsidian, l’importazione di Notion, Note di Apple, Joplin e Bear accettano tutti l’`.enex` — perché è il formato per cui tutti hanno scritto un importatore quando Evernote ha cambiato i prezzi. Quello che non lo legge è un editor di testo: aprilo e trovi XML con le note in base64 e CDATA.',
        ],
      },
      {
        heading: 'Che cosa controllare dopo ogni importazione',
        body: [
          'I tag, per primi. Sono l’organizzazione di una raccolta Evernote e diversi importatori li lasciano cadere: a quel punto diecimila note sono un mucchio e non una raccolta.',
          'Poi gli allegati. Una nota che conteneva un PDF o una fotografia dovrebbe continuare a dirlo; il formato collega le due cose con un hash e non con un nome di file, ed è proprio lì che si vede un importatore che ha preso una scorciatoia.',
        ],
      },
    ],
    action: 'Convertire un .enex in Markdown',
    seo: {
      title: 'Come aprire un file .enex — TransformPipe',
      description:
        'Come esportare un .enex da Evernote, che cosa contiene, quali app lo importano e che cosa controllare dopo: tag e allegati prima di tutto.',
    },
  },
  'how-to-zip': {
    label: 'Aprire uno .zip di esportazione',
    title: 'Come aprire uno .zip esportato da Notion, Confluence o Obsidian',
    lede: 'Decomprimerlo è la metà facile. Quello che c’è dentro è una cartella di file che puntano tutti gli uni agli altri.',
    sections: [
      {
        heading: 'Cosa c’è dentro',
        body: [
          'Un’esportazione di Notion è un file Markdown per pagina con un lungo identificatore aggiunto a ogni nome di file, più un CSV per ogni database. L’esportazione di uno spazio di Confluence è un file HTML per pagina con accanto i suoi allegati. Un vault di Obsidian è già Markdown, nelle cartelle che hai fatto tu.',
          'Tutte e tre si decomprimono con gli strumenti già presenti sulla tua macchina: doppio clic su Windows o macOS, `unzip` in un terminale.',
        ],
      },
      {
        heading: 'Perché i link sono rotti',
        body: [
          'Notion scrive i link rispetto al nome di file esatto che ha generato, identificatore compreso. Rinomina i file in qualcosa di leggibile e ogni link tra le pagine smette di risolversi, che è il modo più comune in assoluto in cui una migrazione va storta.',
          'I link di Confluence puntano ai suoi id di pagina, e gli allegati a un URL di download che si aspetta che tu abbia effettuato l’accesso. Obsidian usa i `[[wikilinks]]`, che risolve solo la sua app.',
        ],
      },
      {
        heading: 'Leggerlo senza ripararlo',
        body: [
          'Aprire cento file uno alla volta per scoprire cosa conteneva uno spazio di lavoro è un lavoro della forma sbagliata. Unire l’esportazione in un unico documento — ogni pagina in ordine, con un indice — dà qualcosa di leggibile in una sola passata, che di solito è a cosa serve un’esportazione archiviata.',
        ],
      },
      {
        heading: 'Quando servono davvero i file separati',
        body: [
          'Se le pagine devono restare file separati con i link funzionanti, la rinomina e la riscrittura dei link devono avvenire insieme, a partire da un’unica mappa dal vecchio nome al nuovo. Farle in due passate lascia una cartella di documenti che puntano tutti a nomi che non esistono più.',
        ],
      },
    ],
    action: 'Convertire uno .zip di esportazione in Markdown',
    seo: {
      title: 'Come aprire uno .zip esportato da Notion o Confluence — TransformPipe',
      description:
        'Cosa c’è dentro un’esportazione di Notion, Confluence o Obsidian, perché i link tra le pagine si rompono e come leggere il tutto come un unico documento.',
    },
  },
  'how-to-assistant': {
    label: 'Condividere da un assistente',
    title: 'Come convertire e condividere un documento da un assistente AI',
    lede: 'Un assistente scrive Markdown tutto il giorno e non riesce a consegnarti una pagina. Collegare questo gli permette di fare entrambe le cose, senza che nessuno copi testo da una scheda all’altra.',
    sections: [
      {
        heading: 'Che cos’è un connettore',
        body: [
          'TransformPipe espone un server MCP su `/api/mcp`. MCP è il protocollo con cui gli assistenti chiamano gli strumenti, quindi aggiungere quell’indirizzo come connettore dà all’assistente una serie di verbi che può usare al posto tuo: converti questo, salvalo, condividilo, elenca cosa c’è.',
          'Non c’è nessuna chiave da incollare. Aggiungere il connettore ti fa passare da un normale accesso, e all’assistente viene concesso l’accesso a quell’account fino a quando non lo scolleghi — la stessa forma che ha l’accesso a qualsiasi altra applicazione con il tuo account.',
        ],
      },
      {
        heading: 'Aggiungerlo',
        body: [
          'Su claude.ai: Impostazioni, poi Connettori, poi Aggiungi connettore personalizzato, e indica `https://transformpipe.com/api/mcp`. Accedi quando te lo chiede, e gli strumenti compaiono nella conversazione successiva.',
          'Da un terminale fa lo stesso un solo comando: `claude mcp add --transport http transformpipe https://transformpipe.com/api/mcp`.',
          'Non c’è altro da configurare. Il connettore si può rimuovere dalla stessa schermata, e rimuoverlo revoca l’accesso immediatamente.',
        ],
      },
      {
        heading: 'Cosa può fare a quel punto',
        body: [
          'Undici strumenti, tutti con il prefisso `tp_`. Quelli che contano in una conversazione sono `tp_convert_markdown`, che trasforma il Markdown in un documento HTML finito, `tp_convert_to_markdown` per un file che fa il percorso inverso, `tp_save_document`, che conserva il risultato nel tuo account, e `tp_share_document`, che lo pubblica e restituisce un link da mandare.',
          'Gli altri sono quelli a cui un assistente ricorre da sé: `tp_list_documents` e `tp_get_document` per ritrovare qualcosa fatto prima, `tp_summarize_document` per dire cosa contiene un documento lungo, `tp_document_versions` per mostrare cosa ha sostituito cosa, `tp_usage` per controllare quanto spazio resta, e `tp_delete_document`.',
          'In pratica la frase utile è breve. Chiedigli di scrivere le note di rilascio, poi chiedigli di pubblicarle — l’assistente converte, salva e condivide, e risponde con l’indirizzo.',
        ],
      },
      {
        heading: 'Cosa può raggiungere, e cosa no',
        body: [
          'Il connettore agisce come te, nel tuo account, sui documenti che possiedi. Non può cambiare l’account, leggere la tua password, creare chiavi API o raggiungere i documenti di qualcun altro.',
          'Una concessione può anche essere in sola lettura, e in quel caso l’assistente può elencare, recuperare e riassumere ma non può salvare, condividere o eliminare — e quella restrizione è applicata sulla credenziale stessa più che sugli strumenti, quindi vale qualunque cosa l’assistente chieda.',
          'Da sapere più che da temere: un assistente con un connettore è un’autorità permanente ad agire, e un documento che legge può contenere istruzioni rivolte a lui. È il costo onesto della comodità, ed è il motivo per cui una concessione in sola lettura è l’impostazione giusta per tutto quello che non hai scritto tu.',
        ],
      },
      {
        heading: 'Quando non usarlo',
        body: [
          'Un connettore è adatto al documento che esiste dentro una conversazione e da nessun’altra parte. Per un file già su disco è più rapido trascinarlo sul convertitore; per qualcosa che succede a ogni merge la forma giusta è l’API o la GitHub Action; e per una cartella di quattrocento file un convertitore locale batte una conversazione.',
        ],
      },
    ],
    action: 'Leggere la documentazione',
    seo: {
      title: 'Convertire e condividere un documento da un assistente AI — TransformPipe',
      description:
        'Come aggiungere TransformPipe a Claude come connettore MCP, cosa fanno gli undici strumenti e cosa un assistente può e non può raggiungere nel tuo account.',
    },
  },
};
