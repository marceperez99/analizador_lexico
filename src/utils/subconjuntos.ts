import { Set } from "typescript";
import { Automata } from "../types/automata";
import { Nodo } from "../types/automata";
import { EPSILON } from "./thompson";

function epsilonCerradura(S: Nodo): Set<Nodo> {
  const cerradura = [S];
  let i = 0;
  while (i < cerradura.length) {
    const vecinosConVacio = cerradura[i].adyacentes[EPSILON] || [];
    for (let nodo of vecinosConVacio) {
      if (!estaNodoEnLista(cerradura, nodo)) {
        cerradura.push(nodo);
      }
    }
    i++;
  }
  return new Set<Nodo>(cerradura);
}
function epsilonCerraduraT(T: Set<Nodo>): Set<Nodo> {
  let cerradura: Set<Nodo> = new Set<Nodo>();
  T.forEach((estado) => {
    const epsilon = epsilonCerradura(estado);
    cerradura = unionConjuntos(cerradura, epsilon);
  });
  return cerradura;
}

function mover(T: Set<Nodo>, a: string): Set<Nodo> {
  const resultado = new Set<Nodo>();
  T.forEach((estado) => {
    let adyacentes = estado.adyacentes[a] || [];
    for (let adyacente of adyacentes) {
      resultado.add(adyacente);
    }
  });
  console.log("Resultado de mover T", resultado);
  return resultado;
}
const unionConjuntos = (
  conjuntoA: Set<Nodo>,
  conjuntoB: Set<Nodo>
): Set<Nodo> => {
  const resultado = new Set<Nodo>();
  conjuntoA.forEach((item) => {
    resultado.add(item);
  });
  conjuntoB.forEach((item) => {
    resultado.add(item);
  });
  return resultado;
};
const estaConjuntoEnLista = (
  lista: Set<Nodo>[],
  conjunto: Set<Nodo>
): boolean => {
  for (let elem of lista) {
    if (compararConjuntos(elem, conjunto)) return true;
  }
  return false;
};
const encontrarConjunto = (lista: Set<Nodo>[], conjunto: Set<Nodo>): number => {
  for (let i = 0; i < lista.length; i++) {
    let elem = lista[i];
    if (compararConjuntos(elem, conjunto)) return i;
  }
  return -1;
};
const compararConjuntos = (
  conjuntoA: Set<Nodo>,
  conjuntoB: Set<Nodo>
): boolean => {
  if (conjuntoA.size !== conjuntoB.size) return false;
  let retorno = true;
  conjuntoA.forEach((elem) => {
    if (!conjuntoB.has(elem)) {
      retorno = false;
    }
  });

  return retorno;
};
const estaNodoEnLista = (listaNodos: Nodo[], nodoA: Nodo): boolean => {
  for (let nodoB of listaNodos) {
    if (esIgualNodo(nodoA, nodoB)) return true;
  }
  return false;
};

const esIgualNodo = (a: Nodo, b: Nodo): boolean => {
  return a.etiqueta === b.etiqueta;
};
export const getAFD = (afn: Automata): Automata => {
  const Destados: Set<Nodo>[] = [];
  const nodos: Nodo[] = [];
  const S = afn.inicio;
  Destados.push(epsilonCerradura(S));
  nodos.push(new Nodo(String(0), false));
  let i = 0;
  const alfabeto = afn.alfabeto;

  while (i < Destados.length) {
    let T = Destados[i];
    console.log("T", T);
    let nodoT = nodos[i];
    console.log("nodo de T", nodoT);

    alfabeto.forEach((caracter) => {
      console.log("Para el caracter", caracter);
      let U = epsilonCerraduraT(mover(T, caracter));
      console.log("U", U);
      if (U.size > 0) {
        if (!estaConjuntoEnLista(Destados, U)) {
          nodos.push(new Nodo(String(Destados.length), false));
          Destados.push(U);
        }
        let index = encontrarConjunto(Destados, U);
        let nodoU = nodos[index];
        console.log("nodo de U", nodoU);
        nodoT.agregarArista(nodoU, caracter);
      }
    });
    i++;
  }
  let afd = new Automata(nodos[0]);
  afd.alfabeto = alfabeto;
  for (let j = 0; j < Destados.length; j++) {
    let conjunto = Destados[j];
    conjunto.forEach((elem) => {
      if (elem.esAceptacion) {
        nodos[j].setAceptacion(true, elem.clase);
      }
    });
  }
  console.log("Nodos", nodos);
  console.log("Destados", Destados);
  return afd;
};
