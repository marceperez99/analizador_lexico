import React, { useState } from "react";
import { Button, Form, Table } from "react-bootstrap";
import { Automata } from "../types/automata";
import SimuladorAFD from "../types/SimuladorAFD";
import { Token } from "../types/token";

type TestDefinitionProps = {
  afd: Automata;
};
const TestDefinition = ({ afd }: TestDefinitionProps) => {
  const [entrada, setEntrada] = useState<string>("");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);
  const onObtenerTokens = () => {
    setError(undefined);
    setTokens([]);
    if (entrada) {
      const visitador = new SimuladorAFD(afd, entrada);
      const listaTokens: Token[] = [];
      visitador.getTokens(
        (token: Token) => {
          listaTokens.push(token);
        },
        (error: any) => setError(error.message)
      );
      setTokens(listaTokens);
    }
  };
  return (
    <div>
      <Form>
        <Form.Label>Entrada</Form.Label>
        <Form.Control
          as="textarea"
          value={entrada}
          rows={1}
          onChange={(e) => setEntrada(e.target.value)}
        />
        {error && <div className="text-danger">{error}</div>}
        <Button onClick={onObtenerTokens} className="mt-3">
          Obtener tokens
        </Button>
      </Form>
      <Table bordered style={{ marginTop: 10 }}>
        <thead>
          <tr>
            <td>Clase</td>
            <td>Lexema</td>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token, i) => {
            return (
              <tr key={i}>
                <td>{token.clase}</td>
                <td>{token.lexema}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};
export default TestDefinition;
