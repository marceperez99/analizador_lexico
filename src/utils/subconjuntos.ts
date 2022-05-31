import { Set } from "typescript";
import { Automata } from "../types/automata"
import { Nodo } from "../types/automata";
import { EPSILON } from "./thompson";

function epsilonCerradura (S: Nodo): Set<Nodo> {
    const cerradura = [S];
    let i = 0;
    while(i < cerradura.length){
        const vecinosConVacio = cerradura[i].adyacentes[EPSILON];
        for(let nodo of vecinosConVacio){
            if(!estaNodoEnLista(cerradura,nodo)){
                cerradura.push(nodo);
            }
        }
        i++;
    }
    return new Set<Nodo> (cerradura);
}
function epsilonCerraduraT (T : Set<Nodo>) : Set<Nodo> {
    let cerradura: Set<Nodo> = new Set<Nodo>();
    T.forEach((estado)=>{
        const epsilon = epsilonCerradura(estado);
        cerradura = unionConjuntos(cerradura,epsilon);
    })
    return new Set<Nodo> ();
}

function mover(T: Set<Nodo>, a: string): Set<Nodo>{
    const resultado = new Set<Nodo>()
    T.forEach(estado => {
        for(let adyacente of estado.adyacentes[a]){
            resultado.add(adyacente);
        }
    })
    return resultado;
}
const unionConjuntos = (conjuntoA : Set<Nodo>, conjuntoB: Set<Nodo>) : Set<Nodo> => {
    const resultado = new Set<Nodo> ();
    conjuntoA.forEach( (item) => {
            resultado.add(item);
    })
    conjuntoB.forEach( (item) => {
            resultado.add(item);
    })
    return resultado;
} 
const estaConjuntoEnLista = (lista: Set<Nodo>[], conjunto: Set<Nodo>) : boolean => {
    for(let elem of lista){
        if(compararConjuntos(elem,conjunto))
            return true
    }
    return false;
}
const encontrarConjunto = (lista: Set<Nodo>[], conjunto: Set<Nodo>) : int => {
    for(let i = 0; i < lista.length; i++){
        let elem = lista[i];
        if(compararConjuntos(elem,conjunto))
            return i;
    }
    return -1;
}
const compararConjuntos = (conjuntoA : Set<Nodo>, conjuntoB: Set<Nodo>) : boolean => {
    if (conjuntoA.size != conjuntoB.size)
        return false;
    conjuntoA.forEach(elem => {
        if(!conjuntoB.has(elem))
            return false
    })

    return true;
}
const estaNodoEnLista = (listaNodos: Nodo[], nodoA: Nodo): boolean => {
    for(let nodoB of listaNodos){
        if (esIgualNodo(nodoA,nodoB))
            return true;
    }
    return false;
}


const esIgualNodo = (a:Nodo, b: Nodo) : boolean => {
    return a.etiqueta === b.etiqueta
}
const getAFD = (afn : Automata) : Automata =>  {
    const Destados : Set<Nodo>[] = []
    const nodos: Nodo[] = [];
    const S = afn.inicio
    Destados.push(epsilonCerradura(S));
    nodos.push(new Nodo(String(0),false))
    let i = 0;
    const alfabeto = afn.alfabeto;
    let nombre = 0
    while(i<Destados.length){
        let T = Destados[i];
        let nodoT = nodos[i];
        alfabeto.forEach(caracter => {
            let U = epsilonCerraduraT(mover(T,caracter));  
            if(!estaConjuntoEnLista(Destados,U)){
                Destados.push(U);
                nodos.push(new Nodo(String(Destados.length),false))
            }
            let index = encontrarConjunto(Destados,U);
            let nodoU = nodos[index]; 
            nodoT.agregarArista(nodoU,caracter);
        })
        i++;
    } 
    let afd = new Automata(nodos[0]);
    return afd;   
    //Automata afd = nDestadosew Automata();
}





