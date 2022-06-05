import { Automata } from "../types/automata";
import { Nodo } from "../types/automata";
//Función que minimiza un AFD
export function minimizarAFD(afd: Automata): Automata {
  let alfabeto = Array.from(afd.alfabeto);
  //Divide en subgrupos iniciales
  let subGrupos = obtenerSubgrupos(afd);
  let cambios = true;

  //Mientras sea necesario hacer cambios en los subgrupos
  while (cambios) {
    cambios = false;
    //Para cada subgrupo
    for (let i = 0; i < subGrupos.length; i++) {
      //Para cada caracter
      for (let caracter of alfabeto) {
        let subGrupo = Array.from(subGrupos[i]);
        //Obtiene un subgrupo adyacente para comparar
        let primerSubGrupo = getSubGrupo(
          subGrupos,
          subGrupo[0].adyacentes[caracter]?.[0]
        );
        for (let nodo of subGrupo) {
          //Si es que las aristas van a un subgrupo distinto, separar los subgrupos
          if (
            primerSubGrupo !==
            getSubGrupo(subGrupos, nodo.adyacentes[caracter]?.[0])
          ) {
            cambios = true;
            let conjunto1 = new Set<Nodo>();
            let conjunto2 = new Set<Nodo>();
            for (let elem of subGrupo) {
              if (
                getSubGrupo(subGrupos, elem.adyacentes[caracter]?.[0]) ===
                primerSubGrupo
              ) {
                conjunto1.add(elem);
              } else {
                conjunto2.add(elem);
              }
            }

            subGrupos[i] = conjunto1;
            subGrupos.push(conjunto2);

            break;
          }
        }
      }
    }
  }

  let nuevosNodos: Nodo[] = [];
  let inicio: Nodo = new Nodo("X");
  for (let subGrupo of subGrupos) {
    let nodo = new Nodo(String(nuevosNodos.length), false);
    //Marca el estado inicial
    if (subGrupo.has(afd.inicio)) {
      inicio = nodo;
    }
    //Marca los estados finales con su clase correspondiente
    for (let estado of Array.from(subGrupo)) {
      if (estado.esAceptacion) {
        nodo.setAceptacion(true, estado.clase);
      }
    }
    nodo.representacion = subGrupo;
    nuevosNodos.push(nodo);
  }
  //Conecta los subgrupos entre si
  let minAFD = new Automata(inicio);
  minAFD.alfabeto = afd.alfabeto;
  for (let i = 0; i < nuevosNodos.length; i++) {
    let subGrupo = Array.from(subGrupos[i]);
    let nodo = nuevosNodos[i];
    alfabeto.forEach((caracter) => {
      //Para cada carácter consigue el subgrupo adyacente
      let index = getSubGrupoIndex(
        subGrupos,
        subGrupo[0].adyacentes[caracter]?.[0]
      );
      //Agrega la transición correspondiente
      if (index !== -1) nodo.agregarArista(nuevosNodos[index], caracter);
    });
  }
  console.log(minAFD);
  return minAFD;
}
function getSubGrupoIndex(subGrupos: Set<Nodo>[], nodo: Nodo) {
  if (nodo === undefined) {
  } else {
    for (let i = 0; i < subGrupos.length; i++) {
      if (subGrupos[i].has(nodo)) {
        return i;
      }
    }
  }
  return -1;
}
function getSubGrupo(subGrupos: readonly Set<Nodo>[], nodo: Nodo) {
  if (nodo === undefined) {
  } else {
    for (let subGrupo of subGrupos) {
      if (subGrupo.has(nodo)) {
        return subGrupo;
      }
    }
  }
  return undefined;
}
//Función que divide en subgrupos para el algoritmo de minimización
function obtenerSubgrupos(afd: Automata): Set<Nodo>[] {
  let nodos = Array.from(obtenerNodos(afd));

  let subGrupos: Set<Nodo>[] = [];
  let noFinales: Set<Nodo> = new Set<Nodo>();
  //Los estados que no son finales pertenecen al primer subgrupo
  for (let nodo of nodos) {
    if (!nodo.esAceptacion) {
      noFinales.add(nodo);
    }
  }
  if (noFinales.size > 0) {
    subGrupos.push(noFinales);
  }
  //Para los estados de aceptación
  for (let nodo of nodos) {
    if (nodo.esAceptacion) {
      let agregado = false;
      //Agrega el estado a un subgrupo en donde todos tienen su misma clase
      for (let subGrupo of subGrupos) {
        let conjuntoLista = Array.from(subGrupo);
        if (
          conjuntoLista[0].esAceptacion &&
          conjuntoLista[0].clase === nodo.clase
        ) {
          agregado = true;
          subGrupo.add(nodo);
        }
      }
      //Si el subgrupo de esa clase aún no fue creado, crear y agregar el estado al subgrupo
      if (!agregado) {
        let nuevoSubGrupo = new Set<Nodo>();
        nuevoSubGrupo.add(nodo);
        subGrupos.push(nuevoSubGrupo);
      }
    }
  }
  return subGrupos;
}
function obtenerNodos(afd: Automata): Set<Nodo> {
  const visitados: Set<Nodo> = new Set<Nodo>();
  const queue = [afd.inicio];
  const alfabeto = afd.alfabeto;
  while (queue.length) {
    const nodo = queue.pop();
    if (nodo && !visitados.has(nodo)) {
      visitados.add(nodo);
      alfabeto.forEach((caracter) => {
        let adyacentes = nodo.adyacentes[caracter] || [];
        for (let elem of adyacentes) {
          queue.push(elem);
        }
      });
    }
  }
  return visitados;
}
