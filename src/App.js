import React from "react";
import { LinkContainer } from "react-router-bootstrap";
import { Nav, Navbar } from "react-bootstrap";
import Routes from "./Routes";
import './App.css';

function App(props) {
  return (
    <div className="App container nav-padding">
      <Navbar bg="light" expand="md" fixed="top" collapseOnSelect>
        <LinkContainer to="/">
          <Navbar.Brand><span role="img" aria-label="microbe">🦠</span> COVID-19 in Oklahoma</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <LinkContainer to="/about">
              <Nav.Link>About</Nav.Link>
            </LinkContainer>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Routes />
    </div>
  );
}

export default App;
