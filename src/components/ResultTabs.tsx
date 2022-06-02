import { Accordion, Tab, Tabs } from "react-bootstrap";
import React from "react";
import { Automata } from "../types/automata";
import AutomataTable from "./AutomataTable";
import TestDefinition from "./TestDefinition";

type ResultTabsProps = {
  afn: Automata | undefined;
  afd: Automata | undefined;
  afdMinimo: Automata | undefined;
};
const ResultTabs = ({ afn, afd, afdMinimo }: ResultTabsProps) => {
  return (
    <Tabs
      defaultActiveKey="entrada"
      id="uncontrolled-tab-example"
      className="my-3"
    >
      <Tab eventKey="entrada" title="Entrada">
        {afdMinimo && <TestDefinition afd={afdMinimo} />}
      </Tab>
      <Tab eventKey="automata" title="Automata">
        <Accordion>
          <Accordion.Item eventKey="0">
            <Accordion.Header>AFN</Accordion.Header>
            <Accordion.Body>
              {afn && <AutomataTable automata={afn} />}
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1">
            <Accordion.Header>AFD</Accordion.Header>
            <Accordion.Body>
              {afd && <AutomataTable hideEpsilon automata={afd} />}
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="2">
            <Accordion.Header>AFD Minimo</Accordion.Header>
            <Accordion.Body>
              {afdMinimo && <AutomataTable hideEpsilon automata={afdMinimo} />}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Tab>
    </Tabs>
  );
};
export default ResultTabs;
