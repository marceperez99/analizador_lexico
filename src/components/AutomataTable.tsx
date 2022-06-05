import React, { useMemo } from "react";
import { Table } from "react-bootstrap";
import { Automata } from "../types/automata";
import { EPSILON } from "../utils/thompson";

type AutomataTableProps = {
  automata: Automata;
  hideEpsilon?: boolean;
};
const AutomataTable = ({ automata, hideEpsilon }: AutomataTableProps) => {
  const [tabla, finales] = useMemo(() => {
    const table: { [k: string]: { [caracter: string]: string[] } } = {};
    const finales: Set<string> = new Set();
    const visitados = new Set<string>();
    const queue = [automata.inicio];

    while (queue.length) {
      const nodo = queue.pop();
      if (nodo && !visitados.has(nodo.etiqueta)) {
        visitados.add(nodo.etiqueta);

        let label: string = nodo.etiqueta;

        if (nodo.representacion)
          label += `: {${Array.from(nodo.representacion)
            .map((n) => n.etiqueta)
            .join(",")}}`;
        if (nodo.esAceptacion) label += ` = ${nodo.clase}`;
        if (nodo.esAceptacion) {
          finales.add(label);
        }
        table[label] = Object.entries(nodo.adyacentes).reduce(
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

    return [table, finales];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [automata]);
  const alfabeto = [
    ...Array.from(automata.alfabeto),
    ...(!hideEpsilon ? [EPSILON] : []),
  ];
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
            <td style={{ fontWeight: finales.has(estado) ? "bold" : "" }}>
              {`${estado}`}
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
