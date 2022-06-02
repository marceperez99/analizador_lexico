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
  const [afn, setAfn] = useState<Automata | undefined>(undefined);
  const [afd, setAfd] = useState<Automata | undefined>(undefined);

  const onCalcularAFN = () => {
    try {
      const a = definicionRegularToAFN(definicionRegular);
      setAfn(a);
      const nuevoAFD = getAFD(a)
      setAfd(nuevoAFD);
      minimizarAFD(nuevoAFD);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Container>
      <h2 className="display-6 mt-3">Analizador Sintatico</h2>
      <hr />
      <Form>
        <Form.Label>Definicion regular del lenguaje</Form.Label>

        <Form.Control
          as="textarea"
          value={definicionRegular}
          rows={3}
          onChange={(e) => setDefinicionRegular(e.target.value)}
        />
        <Button onClick={onCalcularAFN} className="mt-3">
          Calcular AFN
        </Button>
      </Form>

      {afn && <ResultTabs afn={afn} afd={afd} />}
    </Container>
  );
}

export default App;
