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
      if (!r)
        throw new Error(
          `Caracter inesperado '${caracter}' en posicion: ${this.currentChar}`
        );

      [this.estado] = r;
    } else
      throw new Error(
        `Caracter inesperado '${caracter}' en posicion: ${this.currentChar}`
      );
  };
  nextChar = () => {
    // TODO: se puede incluir manejo de numero de linea para detectar linea donde se produce el error

    let caracter = this.entrada[this.currentChar];
    this.currentChar++;
    return caracter;
  };
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
      console.log(c);
      if (!this.automata.alfabeto.has(c))
        throw new Error(
          `Caracter '${c}' no reconocido en posicion: ${this.currentChar}`
        );
      s += c;
      this.mover(c);
      console.log(12);

      c = this.nextChar();
    }
    if (s === "") return undefined;
    const nodo = this.estado;
    if (nodo.esAceptacion) return { clase: nodo.clase || "", lexema: s };
    else throw new Error(`Lexema '${s}' no pertenece a la definicion regular`);
  };

  getTokens(
    callback: (token: Token) => void,
    errorFunction: (error: unknown) => void
  ) {
    let token;
    try {
      do {
        token = this.nextToken();
        console.log("->", token);

        if (token) callback(token);
      } while (token);
    } catch (error: any) {
      errorFunction(error);
    }
  }
}

export default SimuladorAFD;
