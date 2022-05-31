import { Accordion, Tab, Tabs } from "react-bootstrap";
import React from "react";
import { Automata } from "../types/automata";
import AutomataTable from "./AutomataTable";

type ResultTabsProps = {
  afn: Automata;
};
const ResultTabs = ({ afn }: ResultTabsProps) => {
  return (
    <Tabs
      defaultActiveKey="entrada"
      id="uncontrolled-tab-example"
      className="my-3"
    >
      <Tab eventKey="entrada" title="Entrada"></Tab>
      <Tab eventKey="automata" title="Automata">
        <Accordion>
          <Accordion.Item eventKey="0">
            <Accordion.Header>AFN</Accordion.Header>
            <Accordion.Body>
              {afn && <AutomataTable automata={afn} />}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Tab>
    </Tabs>
  );
};
export default ResultTabs;
