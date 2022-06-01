import React, { useState } from "react";

import "./App.css";
import { Button, Container, Form } from "react-bootstrap";
import { Automata } from "./types/automata";
import { definicionRegularToAFN } from "./utils/thompson";
import ResultTabs from "./components/ResultTabs";
import { getAFD } from "./utils/subconjuntos";

function App() {
  const [definicionRegular, setDefinicionRegular] = useState<string>("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [afn, setAfn] = useState<Automata | undefined>(undefined);
  const [afd, setAfd] = useState<Automata | undefined>(undefined);

  const onCalcularAFN = () => {
    setError(undefined);
    try {
      const a = definicionRegularToAFN(definicionRegular);
      setAfn(a);
      setAfd(getAFD(a));
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

      {afn && afd && <ResultTabs afn={afn} afd={afd} />}
    </Container>
  );
}

export default App;
