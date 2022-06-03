import React, { useState } from "react";

import "./App.css";
import { Button, Container, Form } from "react-bootstrap";
import { Automata } from "./types/automata";
import { definicionRegularToAFN } from "./utils/thompson";
import ResultTabs from "./components/ResultTabs";
import { getAFD } from "./utils/subconjuntos";
import { minimizarAFD } from "./utils/minimizacion";

function App() {
  const [definicionRegular, setDefinicionRegular] = useState<string>("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [afn, setAfn] = useState<Automata | undefined>(undefined);
  const [afd, setAfd] = useState<Automata | undefined>(undefined);
  const [afdMinimo, setAfnMinimo] = useState<Automata | undefined>(undefined);
  const onCalcularAFN = () => {
    setError(undefined);
    try {
      const a = definicionRegularToAFN(definicionRegular);
      setAfn(a);
      setAfd(getAFD(a));
      const min = minimizarAFD(getAFD(a));
      setAfnMinimo(min);
    } catch (e: any) {
      setError(e.message);
      console.log(e);
      setAfn(undefined);
      setAfd(undefined);
    }
  };

  return (
    <Container>
      <h2 className="display-6 mt-3">Analizador Lexico</h2>
      <hr />
      <Form>
        <Form.Label>Definicion regular del lenguaje</Form.Label>
        <Form.Control
          as="textarea"
          value={definicionRegular}
          rows={3}
          onChange={(e) => setDefinicionRegular(e.target.value)}
        />
        {error && <div className="text-danger">{error}</div>}
        <Button onClick={onCalcularAFN} className="mt-3">
          Calcular AFN
        </Button>
      </Form>
      <hr />
      {afn || afd || afdMinimo ? (
        <ResultTabs afn={afn} afd={afd} afdMinimo={afdMinimo} />
      ) : (
        <div className="text-muted" style={{ marginTop: 16 }}>
          <h5>Ayuda</h5>
          <ol>
            <li>Se permiten agregar multiples definiciones reguleares.</li>
            <li>
              Cada produccion debe ser de la forma: {"token -> "}
              <i>expresion_regular</i>
              <br />
              Para usar el nombre de un token en la definicion de una expresion
              regular en el lado derecho utilizar la notacion: {"<clase>"}
            </li>

            <br />
            <li>
              Operaciones de expresiones regulares aceptadas:
              <ul>
                <li>Concatenacion: ab</li>
                <li>Cerradura de Kleene: a*</li>
                <li>Operador OR: a|b</li>
                <li>Rangos: [a-z], [0-9]</li>
              </ul>
            </li>
          </ol>
        </div>
      )}
    </Container>
  );
}

export default App;
