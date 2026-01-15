export type LogLevel = "debug" | "info" | "warn" | "error";  // livelli di log supportati

// Struttura di una voce di log
// (usata per il buffer interno)
export interface LogEntry {
  level: LogLevel;
  message: string;
  tag?: string;
  data?: unknown;
  time: string;        // ISO timestamp
  group?: string;
  stack?: string;
}

//questo oggetto definisce le opzioni di configurazione del logger
export interface LoggerOptions {
  enabled?: boolean;          // abilita/disabilita logger globalmente
  level?: LogLevel;           // livello minimo attivo
  useGroups?: boolean;        // usa console.group per raggruppare
  bufferSize?: number;        // numero massimo di entries nel buffer
  showTime?: boolean;         // aggiunge prefisso tempo
}

// Mappa di ordine dei livelli di log
const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

// Opzioni di default
const DEFAULT_OPTIONS: Required<LoggerOptions> = {
  enabled: true,
  level: "info",
  useGroups: true,
  bufferSize: 300,
  showTime: true,
};

// Servizio di logging avanzato
// Supporta livelli, buffer circolare, gruppi, e formattazione
export class LoggerServices {
  private static opts: Required<LoggerOptions> = { ...DEFAULT_OPTIONS };  // opzioni correnti
  private static buffer: LogEntry[] = []; // buffer circolare delle ultime entries

  // ———————————————————————————————————————
  // Configurazione
  // ———————————————————————————————————————
  static configure(options: LoggerOptions = {}) { // merge con opzioni correnti
    this.opts = { ...this.opts, ...options }; // mantiene le opzioni non specificate
  }

  static enable() {
    this.opts.enabled = true; // abilita il logger
  }

  static disable() {
    this.opts.enabled = false; // disabilita il logger
  }

  static setLevel(level: LogLevel) {
    this.opts.level = level; // imposta il livello minimo di log
  }

  static setBufferSize(size: number) { // imposta la dimensione del buffer
    this.opts.bufferSize = Math.max(0, size); // evita valori negativi
    if (this.buffer.length > this.opts.bufferSize) { // tronca il buffer se necessario
      this.buffer = this.buffer.slice(-this.opts.bufferSize); // mantiene solo le ultime entries
    }
  }

  // ———————————————————————————————————————
  // API pubblica
  // ———————————————————————————————————————
  static debug(message: string, data?: unknown, tag?: string, group?: string) { // log di debug
    this.log("debug", message, data, tag, group); // chiama il metodo log interno 
  }

  static info(message: string, data?: unknown, tag?: string, group?: string) { // log informativo
    this.log("info", message, data, tag, group); // chiama il metodo log interno
  }

  static warn(message: string, data?: unknown, tag?: string, group?: string) { // log di avviso
    this.log("warn", message, data, tag, group); // chiama il metodo log interno
  }

  static error(message: string, error?: unknown, tag?: string, group?: string) { // log di errore
    const stack = this.extractStack(error);  // estrae lo stack trace dall'errore
    this.log("error", message, error, tag, group, stack);   // chiama il metodo log interno
  }

  // ———————————————————————————————————————
  // Buffer e ispezione
  // ———————————————————————————————————————
  static getBuffer(): LogEntry[] {  // restituisce una copia del buffer corrente
    return [...this.buffer]; // copia superficiale
  }

  static clearBuffer() {  // svuota il buffer
    this.buffer = []; // resetta l'array
  }

  // ———————————————————————————————————————
  // Interni
  // ———————————————————————————————————————
  private static log( // metodo interno di log
    level: LogLevel,
    message: string,
    data?: unknown,
    tag?: string,
    group?: string,
    stack?: string
  ) {
    if (!this.opts.enabled) return;  // logger disabilitato
    if (LEVEL_ORDER[level] < LEVEL_ORDER[this.opts.level]) return; // livello non sufficiente

    // Crea la voce di log
    const time = new Date().toISOString();
    const entry: LogEntry = { level, message, tag, data, time, group, stack }; // crea la voce di log

    // Buffer circolare
    this.buffer.push(entry);
    if (this.buffer.length > this.opts.bufferSize) { // rimuove l'entry più vecchia se supera la dimensione massima
      this.buffer.shift(); // rimuove la prima entry
    }

    // Formattazione console
    const prefixParts: string[] = [];
    if (this.opts.showTime) prefixParts.push(`[${time}]`); // prefisso tempo
    prefixParts.push(level.toUpperCase()); // prefisso livello
    if (tag) prefixParts.push(`[${tag}]`); // prefisso tag

    const prefix = prefixParts.join(" "); // unisce i prefissi

    const payload = data !== undefined ? data : undefined; // payload opzionale
    const hasGroup = this.opts.useGroups && typeof console.groupCollapsed === "function" && !!group; // verifica se usare i gruppi

    try {
      if (hasGroup) console.groupCollapsed(`${prefix} — ${message} ${group ? `(${group})` : ""}`); // inizia il gruppo

      switch (level) { // log secondo il livello
        case "debug":
          payload !== undefined ? console.debug(messagePrefix(prefix, message), payload) : console.debug(messagePrefix(prefix, message));
          break;
        case "info":
          payload !== undefined ? console.info(messagePrefix(prefix, message), payload) : console.info(messagePrefix(prefix, message));
          break;
        case "warn":
          payload !== undefined ? console.warn(messagePrefix(prefix, message), payload) : console.warn(messagePrefix(prefix, message));
          break;
        case "error":
          payload !== undefined ? console.error(messagePrefix(prefix, message), payload) : console.error(messagePrefix(prefix, message));
          if (stack) console.error("Stack:", stack);
          break;
      }

      if (hasGroup) console.groupEnd(); // chiude il gruppo
    } catch {
      // fallback in caso di environment non standard
      console.log(messagePrefix(prefix, message), payload ?? "");
      if (stack) console.log("Stack:", stack); // log dello stack se presente
    }
  }

  private static extractStack(error: unknown): string | undefined { // estrae lo stack trace da un erro
    if (!error) return undefined; // nessun errore fornito
    if (error instanceof Error && error.stack) return error.stack;  // estrae lo stack se è un oggetto Error
    if (typeof error === "object") { // tenta di serializzare l'errore
      try {
        return JSON.stringify(error); // converte l'errore in stringa JSON
      } catch {
        return String(error); // fallback a stringa semplice
      } 
    }
    return String(error); // converte a stringa se è un tipo primitivo
  }
}

function messagePrefix(prefix: string, message: string) { // formatta il messaggio con il prefisso
  return `${prefix} — ${message}`;
}

// ———————————————————————————————————————
// Bootstrap consigliato (opzionale)
// Disattiva debug in produzione
// ———————————————————————————————————————
const isProd = import.meta.env.MODE === "production";

// Configurazione iniziale del logger
LoggerServices.configure({
  enabled: true,
  level: isProd ? "info" : "debug",
  useGroups: true,
  bufferSize: 500,
  showTime: true,
});

export default LoggerServices;
