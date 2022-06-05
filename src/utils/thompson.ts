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
    // se mueve en la cadena de entrada
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
      throw new Error("Caracter " + caracter + " esperado");
    }
  };
  advance = (): string => {
    const caracter = this.currentToken;
    this.currentToken = this.lexer.nextToken();

    return caracter;
  };
  expresion = (): ResultadoProduccion => {
    // Regla: EXPRESION -> OR
    return this.or();
  };
  concat = (): ResultadoProduccion => {
    // Regla: CONCAT -> KLEENE CONCAT
    const kleene = this.kleene();
    return this.R2(kleene);
  };

  R2 = (result: ResultadoProduccion): ResultadoProduccion => {
    // Regla: R2 -> KLEENE R2
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
    // Regla: OR -> OR R1
    const concat = this.concat();
    return this.R1(concat);
  };
  R1 = (resultado: ResultadoProduccion): ResultadoProduccion => {
    // Regla: R1 -> '|' R1 | ε
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
   *Simplificacion de produccion, se hace que la funcion retorne true si es que logro matchear el *, false en caso contrario
   para que en la produccion kleene se agregue la operacion de cerradura de kleene en base al resultado de hasKleene
   */
  hasKleene = (): boolean => {
    // Regla: HAS_KLEENE -> * | ε
    if (this.currentToken === "*") {
      this.match("*");
      return true;
    } else {
      return false;
    }
  };
  kleene = (): ResultadoProduccion => {
    // Regla: KLEENE -> PARENTESIS HAS_KLEENE
    const parentesis = this.parentesis();

    // luego de obtener el resultado de parentesis se usa el metodo hasKleene para verificar si hay un * para indicar la operacion de kleene
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
    // Regla: PARENTESIS -> ( EXPRESION ) | CARACTER_O_RANGO
    if (this.currentToken === "(") {
      console.log(this.currentToken);

      this.match("(");
      const expresion = this.expresion();
      this.match(")");
      return expresion;
    } else {
      const x = this.caracterORango();
      return x;
    }
  };
  caracterORango = (): ResultadoProduccion => {
    // Regla: CARACTER_O_RANGO -> [ RANGO ] | CARACTER
    if (this.currentToken === "[") {
      this.match("[");
      const rango = this.rango();
      this.match("]");
      return rango;
    } else {
      return this.caracter();
    }
  };
  rango = (): ResultadoProduccion => {
    // Regla: RANGO -> LETRA_MINUSCULA-LETRA_MINUSCULA | LETRA_MAYUSCULA-LETRA_MAYUSCULA | CIFRA-CIFRA
    // Esta produccion realiza la siguiente transformacion sobre el rango: [a-d] = a|b|c|d para utilizar la misma construccion de thompson utilizada para la operacion OR
    const nodoInicio = new Nodo(`${this.estadoCounter++}`);
    const nodoFin = new Nodo(`${this.estadoCounter++}`);
    nodoFin.setAceptacion(true, this.clase);
    if (this.currentToken >= "a" && this.currentToken <= "z") {
      const caracterInicio = this.advance();
      this.match("-");
      const caracterFin = this.advance();
      if (caracterFin >= caracterInicio && caracterFin <= "z") {
        // se verifica que el rango sea valido
        const codeInicio = caracterInicio.charCodeAt(0);
        const codeFin = caracterFin.charCodeAt(0);
        for (let i = codeInicio; i <= codeFin; i++) {
          const a = new Nodo(`${this.estadoCounter++}`);
          const b = new Nodo(`${this.estadoCounter++}`);
          a.agregarArista(b, String.fromCharCode(i));
          nodoInicio.agregarArista(a, EPSILON);
          b.agregarArista(nodoFin, EPSILON);
          this.alfabeto.add(String.fromCharCode(i));
        }
      } else {
        throw new Error(
          `Caracter '${caracterFin}' invalido en definicion de rango`
        );
      }
    } else if (this.currentToken >= "A" && this.currentToken <= "Z") {
      const caracterInicio = this.advance();
      this.match("-");
      const caracterFin = this.advance();
      if (caracterFin >= caracterInicio && caracterFin <= "Z") {
        // se verifica que el rango sea valido
        const codeInicio = caracterInicio.charCodeAt(0);
        const codeFin = caracterFin.charCodeAt(0);

        for (let i = codeInicio; i <= codeFin; i++) {
          const a = new Nodo(`${this.estadoCounter++}`);
          const b = new Nodo(`${this.estadoCounter++}`);
          a.agregarArista(b, String.fromCharCode(i));
          nodoInicio.agregarArista(a, EPSILON);
          b.agregarArista(nodoFin, EPSILON);
          this.alfabeto.add(String.fromCharCode(i));
        }
      } else {
        throw new Error(
          `Caracter '${caracterFin}' invalido en definicion de rango`
        );
      }
    } else if (this.currentToken >= "0" && this.currentToken <= "9") {
      const caracterInicio = this.advance();
      this.match("-");
      const caracterFin = this.advance();
      if (caracterFin >= caracterInicio && caracterFin <= "9") {
        // se verifica que el rango sea valido
        const codeInicio = caracterInicio.charCodeAt(0);
        const codeFin = caracterFin.charCodeAt(0);

        for (let i = codeInicio; i <= codeFin; i++) {
          const a = new Nodo(`${this.estadoCounter++}`);
          const b = new Nodo(`${this.estadoCounter++}`);
          a.agregarArista(b, String.fromCharCode(i));
          nodoInicio.agregarArista(a, EPSILON);
          b.agregarArista(nodoFin, EPSILON);
          this.alfabeto.add(String.fromCharCode(i));
        }
      } else {
        throw new Error(
          `Caracter '${caracterFin}' invalido en definicion de rango`
        );
      }
    }
    return { nodoFin, nodoInicio };
  };
  caracter = (): ResultadoProduccion => {
    // Regla: CARACTER -> [a-zA-Z] | [0-9] | , | . | \( | \) | \*

    if (this.currentToken === "\\") {
      // escape de caracteres especiales
      this.match("\\");
    }
    // se obtiene un caracter y se avanza
    const caracter = this.advance();
    if (caracter === undefined)
      throw new Error("Entrada finalizada inesperadamente");
    // se agrega el caracter al alfabeto
    this.alfabeto.add(caracter);

    const nodoInicio = new Nodo(`${this.estadoCounter++}`);
    const nodoFin = new Nodo(`${this.estadoCounter++}`);

    nodoFin.setAceptacion(true, this.clase);
    nodoInicio.agregarArista(nodoFin, caracter);

    return { nodoInicio, nodoFin };
  };

  convert = (): [Nodo, Set<string>] => {
    // Metodo llamado para conversion de expresion regular a AFN
    const resultado = this.expresion();
    if (this.currentToken !== undefined)
      throw new Error("Caracter inesperado: " + this.currentToken);

    return [resultado.nodoInicio, this.alfabeto];
  };
}

export const parseDefinicion = (
  definicionRegular: string
): { clase: string; expresionRegular: string }[] => {
  // se obtienen los pares: (clase, expresionRegular)
  const reglas = definicionRegular
    .trim()
    .split("\n")
    .map((regla) => {
      let [clase, expresionRegular] = regla
        .split("->")
        .map((cadena) => cadena.trim());
      //Si la clase o la expresion regular es vacia, se lanza error
      if (!clase || !expresionRegular)
        throw new Error("Expresion no valida: " + regla);
      return [clase, expresionRegular];
    });
  const n = reglas.length;
  // se reemplazan los usos de las clases en las expresiones regulares por las expresiones regulares
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      reglas[j][1] = reglas[j][1].replaceAll(
        `<${reglas[i][0]}>`,
        `(${reglas[i][1]})`
      );
    }
  }
  // si luego de reemplazar n veces cada clase en las expresiones regulares aun se puede hacer un reemplazo, entonces se lanza error indicando una relacion ciclica
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (reglas[j][1].includes(`<${reglas[i][0]}>`))
        throw new Error(
          "Definicion regular invalida, relacion cíclica entre producciones"
        );
    }
  }
  return reglas.map(([clase, expresionRegular]) => ({
    clase,
    expresionRegular,
  }));
};

export const definicionRegularToAFN = (definicion: string): Automata => {
  //se crea un nodo de inicio con etiqueta 0
  const inicio = new Nodo("0");
  const alfabeto = new Set<string>();

  let estadoCounter = 1;
  const producciones = parseDefinicion(definicion);
  for (const { clase, expresionRegular } of producciones) {
    let traductor = new RegExpTraductor(expresionRegular, estadoCounter, clase);
    let [afn, alfabetoAfn] = traductor.convert();
    // se conecta el inicio al afn de la expresion regular
    inicio.agregarArista(afn, EPSILON);
    // se agregan los caracteres  del afn al alfabeto del afn final
    alfabetoAfn.forEach((caracter) => alfabeto.add(caracter));
    estadoCounter = traductor.estadoCounter;
  }
  const automata = new Automata(inicio);
  automata.alfabeto = alfabeto;
  return automata;
};

export default RegExpTraductor;
