import { Automata, Nodo } from "../types/automata";

type ResultadoProduccion = {
  nodoInicio: Nodo;
  nodoFin: Nodo;
};

class SimpleLexer {
  cadena: string;
  position: number;
  currentToken: string;

  constructor(cadena: string) {
    this.cadena = cadena;
    this.position = 0;
    this.currentToken = cadena[0];
  }
  nextToken = (): string => {
    this.position++;
    this.currentToken = this.cadena[this.position];
    return this.currentToken;
  };
}
export const EPSILON = "ε";
const SIMBOLOS_ESPECIALES = ["(", ")", "|", "*"];
class RegExpTraductor {
  //
  lexer: SimpleLexer;
  // token actual
  currentToken: string;
  // contador usado para asignar etiquetas a nodos creados
  estadoCounter: number;

  clase: string;
  alfabeto: Set<string>;

  constructor(regexString: string, initCounter: number, clase: string) {
    this.lexer = new SimpleLexer(regexString);
    this.currentToken = this.lexer.currentToken;
    this.estadoCounter = initCounter !== undefined ? initCounter : 0;
    this.clase = clase;
    this.alfabeto = new Set<string>();
  }
  match = (caracter: string) => {
    if (this.lexer.currentToken === caracter) {
      this.currentToken = this.lexer.nextToken();
    } else {
      throw new Error("RegExp error");
    }
  };
  advance = (): string => {
    const caracter = this.currentToken;
    this.currentToken = this.lexer.nextToken();

    return caracter;
  };
  expresion = (): ResultadoProduccion => {
    return this.or();
  };
  concat = (): ResultadoProduccion => {
    const kleene = this.kleene();
    return this.R2(kleene);
  };
  R2 = (result: ResultadoProduccion): ResultadoProduccion => {
    if (
      this.currentToken &&
      (this.currentToken === "(" ||
        !SIMBOLOS_ESPECIALES.includes(this.currentToken))
    ) {
      const kleene = this.kleene();

      result.nodoFin.adyacentes = kleene.nodoInicio.adyacentes;
      result.nodoFin.setAceptacion(false);
      return this.R2({
        nodoInicio: result.nodoInicio,
        nodoFin: kleene.nodoFin,
      });
    } else {
      return result;
    }
  };
  or = (): ResultadoProduccion => {
    const concat = this.concat();
    return this.R1(concat);
  };
  R1 = (resultado: ResultadoProduccion): ResultadoProduccion => {
    if (this.currentToken === "|") {
      this.match("|");
      const concat = this.concat();
      resultado.nodoFin.setAceptacion(false);

      const nodoInicio = new Nodo(`${this.estadoCounter++}`);
      const nodoFin = new Nodo(`${this.estadoCounter++}`);
      nodoFin.setAceptacion(true, this.clase);

      nodoInicio.agregarArista(resultado.nodoInicio, EPSILON);
      nodoInicio.agregarArista(concat.nodoInicio, EPSILON);

      concat.nodoFin.agregarArista(nodoFin, EPSILON);
      concat.nodoFin.setAceptacion(false);
      resultado.nodoFin.agregarArista(nodoFin, EPSILON);

      return this.R1({ nodoInicio, nodoFin });
    } else {
      return resultado;
    }
  };

  /**
   *Simplificacion de produccion,
   */
  hasKleene = (): boolean => {
    if (this.currentToken === "*") {
      this.match("*");
      return true;
    } else {
      return false;
    }
  };
  kleene = (): ResultadoProduccion => {
    const parentesis = this.parentesis();

    if (this.hasKleene()) {
      const initState = this.estadoCounter++;
      const endState = this.estadoCounter++;
      parentesis.nodoFin.setAceptacion(false);

      const initNode = new Nodo(`${initState}`);
      const endNode = new Nodo(`${endState}`);
      initNode.agregarArista(parentesis.nodoInicio, EPSILON);
      initNode.agregarArista(endNode, EPSILON);
      parentesis.nodoFin.agregarArista(endNode, EPSILON);
      parentesis.nodoFin.agregarArista(parentesis.nodoInicio, EPSILON);
      endNode.setAceptacion(true, this.clase);

      return { nodoInicio: initNode, nodoFin: endNode };
    } else {
      return parentesis;
    }
  };
  parentesis = (): ResultadoProduccion => {
    if (this.currentToken === "(") {
      this.match("(");
      const expresion = this.expresion();
      this.match(")");
      return expresion;
    } else {
      const x = this.caracter();

      return x;
    }
  };

  caracter = (): ResultadoProduccion => {
    // TODO: Mejorar deteccion de caracteres
    // [a-zA-Z] | [0-9] | , | . | \( | \) | *
    if (this.currentToken === "\\") {
      // escape de caracteres especiales
      this.match("\\");
    }
    const caracter = this.advance();
    this.alfabeto.add(caracter);

    const nodoInicio = new Nodo(`${this.estadoCounter++}`);
    const nodoFin = new Nodo(`${this.estadoCounter++}`);

    nodoFin.setAceptacion(true, this.clase);
    nodoInicio.agregarArista(nodoFin, caracter);

    return { nodoInicio, nodoFin };
  };
  convert = (): [Nodo, Set<string>] => [
    this.expresion().nodoInicio,
    this.alfabeto,
  ];
}

export const parseDefinicion = (
  definicionRegular: string
): { clase: string; expresionRegular: string }[] => {
  const reglas = definicionRegular
    .trim()
    .split("\n")
    .map((regla) => {
      const [clase, expresionRegular] = regla
        .split("->")
        .map((cadena) => cadena.trim());
      console.log(clase, expresionRegular);

      if (!clase.startsWith("<") || !clase.endsWith(">")) {
        throw new Error(
          "Lado izquierdo de expresion mal formado, debe ser de la forma <clase>"
        );
      }
      return [clase, expresionRegular];
    });
  const n = reglas.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      reglas[j][1] = reglas[j][1].replaceAll(reglas[i][0], `(${reglas[i][1]})`);
    }
  }
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (reglas[j][1].includes(reglas[i][0]))
        throw new Error("Definicion regular invalida");
    }
  }
  return reglas.map(([clase, expresionRegular]) => ({
    clase,
    expresionRegular,
  }));
};

export const definicionRegularToAFN = (definicion: string): Automata => {
  const inicio = new Nodo("0");
  const alfabeto = new Set<string>();

  let estadoCounter = 1;
  const producciones = parseDefinicion(definicion);
  for (const { clase, expresionRegular } of producciones) {
    console.log(clase, expresionRegular);

    let traductor = new RegExpTraductor(expresionRegular, estadoCounter, clase);
    let [afn, alfabetoAfn] = traductor.convert();
    inicio.agregarArista(afn, EPSILON);
    alfabetoAfn.forEach((caracter) => alfabeto.add(caracter));
    estadoCounter = traductor.estadoCounter;
  }
  const automata = new Automata(inicio);
  automata.alfabeto = alfabeto;
  return automata;
};

export default RegExpTraductor;
