import React from "react";

export default function About(props) {
  return (
    <div className="About">
      <h1>About</h1>
      <p>Made by <a target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/in/patrickhpalmer/">Patrick Palmer</a> using data from the <a target="_blank" rel="noopener noreferrer" href="https://coronavirus.health.ok.gov/">Oklahoma State Department of Health</a>.</p>
      <p>Web client built with <a href="https://create-react-app.dev/">React</a>, <a href="https://react-bootstrap.github.io/">React Bootstrap</a>, and <a href="https://uber.github.io/react-vis/">React-Vis</a> (<a target="_blank" rel="noopener noreferrer" href="https://github.com/ppalms/coronavirus-ok-client">source</a>).</p>
      <p>API built with Node.js using AWS serverless platform (<a href="https://github.com/ppalms/coronavirus-ok-api">source</a>).</p>
    </div>
  );
}
