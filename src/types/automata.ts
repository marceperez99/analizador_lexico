export class Nodo {
  etiqueta: string;
  adyacentes: { [caracter: string]: Nodo[] };
  esAceptacion: boolean;
  clase: string | undefined;
  constructor(etiqueta: string, esAceptacion: boolean = false) {
    this.etiqueta = etiqueta;
    this.adyacentes = {};
    this.esAceptacion = esAceptacion;
  }

  setAceptacion(value: boolean, clase: string | undefined = undefined) {
    this.esAceptacion = value;
    this.clase = clase;
  }
  agregarArista(b: Nodo, caracter: string) {
    const adyacences = this.adyacentes[caracter] || [];
    adyacences.push(b);
    this.adyacentes[caracter] = adyacences;
  }
  toString() {
    return JSON.stringify(this);
  }
}

export class Automata {
  readonly inicio: Nodo | undefined;
  alfabeto: Set<string>;
  estado: Nodo | undefined;

  constructor(inicio: Nodo) {
    this.alfabeto = new Set<string>();
    this.estado = inicio;
    this.inicio = inicio;
  }

  addToAlfabeto(...alfabetos: Set<string>[]) {
    const caracteres = alfabetos.reduce(
      (acc: string[], curr: Set<string>) => [...acc, ...Array.from(curr)],
      []
    );
    this.alfabeto = new Set<string>([
      ...Array.from(this.alfabeto),
      ...caracteres,
    ]);
  }
}
