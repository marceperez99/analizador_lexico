import { Automata, Nodo } from "./automata";
import { DELIMITADORES } from "../constants";
import { Token } from "./token";
class SimuladorAFD {
  automata: Automata;
  entrada: string;
  currentChar: number;
  estado: Nodo;
  constructor(automata: Automata, entrada: string) {
    this.automata = automata;
    console.log(automata);

    this.estado = automata.inicio;
    this.entrada = entrada;
    this.currentChar = 0;
  }
  mover = (caracter: string) => {
    if (this.estado && this.estado?.adyacentes) {
      const r = this.estado.adyacentes[caracter];
      // si no existe una transición del estado actual con el caracter recibido se alza error
      if (!r)
        throw new Error(
          `Caracter inesperado '${caracter}' en posicion: ${this.currentChar}`
        );

      [this.estado] = r;
    } else {
      // si el estado actual es undefined o el estado no tiene transiciones se lanza error
      throw new Error(
        `Caracter inesperado '${caracter}' en posicion: ${this.currentChar}`
      );
    }
  };
  nextChar = () => {
    let caracter = this.entrada[this.currentChar];
    this.currentChar++;
    return caracter;
  };
  /**
   * Metodo que retorna el siguiente token de la entrada
   * @returns Token
   */
  nextToken = (): Token | undefined => {
    while (
      this.currentChar < this.entrada.length &&
      DELIMITADORES.includes(this.entrada[this.currentChar])
    ) {
      this.currentChar++;
    }

    let s = "";
    this.estado = this.automata.inicio;
    let c = this.nextChar();
    while (!DELIMITADORES.includes(c)) {
      // mientras el caracter leido no sea un delimitador de lexema
      // se verifica si el caracter está en la gramática
      if (!this.automata.alfabeto.has(c))
        throw new Error(
          `Caracter '${c}' no reconocido en posicion: ${this.currentChar}`
        );
      // se agrega el caracter al lexema formado
      s += c;
      // se hace la transición correspondiente en el automata
      this.mover(c);

      c = this.nextChar();
    }
    if (s === "") return undefined;
    // se obtiene el estado final en el que se quedó
    const nodo = this.estado;
    // si el nodo es de aceptacion se agrega la clase y el lexema, caso contrario se lanza error
    if (nodo.esAceptacion) return { clase: nodo.clase || "", lexema: s };
    else throw new Error(`Lexema '${s}' no pertenece a la definicion regular`);
  };

  /**
   * Metodo ejecutado para obtener los tokens de la entrada
   * @param callback: funcion que se ejecuta cuando se encuentra un token
   * @param errorFunction: funcion ejecutada cuando se da un error
   */
  getTokens(
    callback: (token: Token) => void,
    errorFunction: (error: unknown) => void
  ) {
    let token;
    try {
      do {
        token = this.nextToken();
        if (token) callback(token);
      } while (token);
    } catch (error: any) {
      errorFunction(error);
    }
  }
}

export default SimuladorAFD;
