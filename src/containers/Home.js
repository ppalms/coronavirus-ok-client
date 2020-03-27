import React, { useState, useEffect } from "react";
import Card from "react-bootstrap/Card";
import { API } from "aws-amplify";
import moment from "moment";
import "moment-timezone";
import "./Home.css";
import InfectionRateChart from "../components/InfectionRateChart";

export default function Home(props) {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function onLoad() {
      if (!isLoading) {
        return;
      }

      try {
        const testResults = await loadTestResults();
        setTestResults(testResults);
      } catch (e) {
        console.error(e);
      }

      setIsLoading(false);
    }

    onLoad();
  });

  async function loadTestResults() {
    const today = moment().format();
    const yesterday = moment().subtract(1, 'day').format();

    let results = await API.get("results", `/listResults/${today}`);
    if (results.length === 0) {
      results = await API.get("results", `/listResults/${yesterday}`);
    }

    return results
      .filter(result =>
        result.resultType === 'Positive (In-State)'
        || result.resultType === 'Deaths'
        || result.resultType === 'Hospitalized');
  }

  function getCurrentPositive(testResults) {
    const currentPositive = testResults.find(r => r.resultType === 'Positive (In-State)');

    return (
      <div key={currentPositive.resultId} className="col-12 text-center mb-2">
        <Card className="shadow-sm">
          <Card.Body>
            <Card.Title>{currentPositive.resultType}</Card.Title>
            <Card.Text className="display-3 text-danger"><strong>{currentPositive.count}</strong></Card.Text>
          </Card.Body>
        </Card>
      </div>
    );
  }

  function getCurrentSecondary(testResults) {
    const currentSecondary = testResults.filter(r =>
      r.resultType === 'Deaths' || r.resultType === 'Hospitalized');

    return currentSecondary.map((result, _) =>
      <div key={result.resultId} className="col-sm-6 text-center mb-2">
        <Card className="shadow-sm">
          <Card.Body>
            <Card.Title>{result.resultType}</Card.Title>
            <Card.Text className="text-muted secondary-text"><strong>{result.count}</strong></Card.Text>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="Home container">
      <h1>Current Cases</h1>

      <div className="row">
        {!isLoading && getCurrentPositive(testResults)}
      </div>

      <div className="row">
        {!isLoading && getCurrentSecondary(testResults)}
      </div>

      <div className="row">
        <InfectionRateChart range={7} />
      </div>
    </div>
  );
}
