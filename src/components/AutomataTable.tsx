import React, { useMemo } from "react";
import { Table } from "react-bootstrap";
import { Automata } from "../types/automata";
import { EPSILON } from "../utils/thompson";

type AutomataTableProps = {
  automata: Automata;
};
const AutomataTable = ({ automata }: AutomataTableProps) => {
  const finales = new Set<string>();
  const tabla = useMemo(() => {
    const table: { [k: string]: { [caracter: string]: string[] } } = {};
    const visitados = new Set<string>();
    const queue = [automata.inicio];

    while (queue.length) {
      const nodo = queue.pop();
      if (nodo && !visitados.has(nodo.etiqueta)) {
        visitados.add(nodo.etiqueta);
        if (nodo.esAceptacion) finales.add(nodo.etiqueta);
        table[nodo.etiqueta] = Object.entries(nodo.adyacentes).reduce(
          (acc, [key, nodos]) => ({
            ...acc,
            [key]: nodos.map((n) => {
              queue.push(n);
              return n.etiqueta;
            }),
          }),
          {}
        );
      }
    }

    return table;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [automata]);
  const alfabeto = [...Array.from(automata.alfabeto), EPSILON];
  return (
    <Table bordered>
      <thead>
        <tr>
          <th align="center">Estado </th>
          {alfabeto.map((caracter) => (
            <th align="center" key={caracter}>
              {caracter}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Object.entries(tabla).map(([estado, adyacentes]) => (
          <tr key={estado}>
            <td
              align="center"
              style={{ fontWeight: finales.has(estado) ? "bold" : "" }}
            >
              {estado}
            </td>
            {alfabeto.map((caracter) => (
              <td align="center">{adyacentes[caracter]?.join(", ")}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default AutomataTable;
