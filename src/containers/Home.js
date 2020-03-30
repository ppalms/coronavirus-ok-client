import React, { useState, useEffect } from "react";
import { API } from "aws-amplify";
import moment from "moment";
import "moment-timezone";
import "./Home.css";
import InfectionRateChart from "../components/InfectionRateChart";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, Tooltip, OverlayTrigger } from "react-bootstrap";

export default function Home(props) {
  const [testResults, setTestResults] = useState([]);
  const [confirmedChange, setConfirmedChange] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function onLoad() {
      if (!isLoading) {
        return;
      }

      try {
        const testResults = await loadData();
        setTestResults(testResults);
      } catch (e) {
        console.error(e);
      }

      setIsLoading(false);
    }

    onLoad();
  });

  async function loadData() {
    const results = await getMostRecentResults();

    await calculateDailyChange(results);

    return results
      .filter(result =>
        result.resultType === 'Positive (In-State)'
        || result.resultType === 'Deaths'
        || result.resultType === 'Hospitalized');
  }

  async function getMostRecentResults() {
    let today = moment().format();
    let results = await API.get("results", `/listCasesStatewide/${today}`);

    if (results.length === 0) {
      today = moment().subtract(1, 'day').format();
      results = await API.get("results", `/listCasesStatewide/${today}`);
    }

    return results;
  }

  async function calculateDailyChange(results) {
    const todayConfirmed = results.find(r => r.resultType === 'Positive (In-State)');

    const yesterday = moment(todayConfirmed.retrievedDate).subtract(1, 'day').format();
    const yesterdayResults = await API.get("results", `/listCasesStatewide/${yesterday}`);
    const yesterdayConfirmed = yesterdayResults.find(r => r.resultType === 'Positive (In-State)');

    const change = ((todayConfirmed.count - yesterdayConfirmed.count) / yesterdayConfirmed.count * 100).toFixed(2);

    setConfirmedChange({ change: change, direction: change > 0 ? 'up' : 'down' });
  }

  function getCurrentPositive(testResults) {
    const currentPositive = testResults.find(r => r.resultType === 'Positive (In-State)');

    return (
      <div key={currentPositive.resultType} className="col-12 text-center">
        <Card className="shadow-sm">
          <Card.Body>
            <Card.Title>Confirmed</Card.Title>
            <Card.Text>
              <span className="display-3 text-danger d-block"><strong>{currentPositive.count}</strong></span>
              <OverlayTrigger placement="bottom" overlay={showPercentChangeTooltip}>
                <span className={`badge badge-${confirmedChange.direction === 'up' ? 'warning' : 'success'}`}>
                  <FontAwesomeIcon icon={`arrow-${confirmedChange.direction}`} /> {confirmedChange.change}%
                </span>
              </OverlayTrigger>
            </Card.Text>
          </Card.Body>
        </Card>
      </div>
    );
  }

  function getCurrentSecondary(testResults) {
    const currentSecondary = testResults.filter(r =>
      r.resultType === 'Deaths' || r.resultType === 'Hospitalized');

    return currentSecondary.map((result, _) =>
      <div key={result.resultType} className="col-sm-6 text-center mt-2">
        <Card className="shadow-sm">
          <Card.Body>
            <Card.Title>{result.resultType}</Card.Title>
            <Card.Text className="text-muted secondary-text"><strong>{result.count}</strong></Card.Text>
          </Card.Body>
        </Card>
      </div>
    );
  }

  function showRetrievedDate(props) {
    return (
      <Tooltip id="updated-date-info" {...props}>
        <div>Last updated:</div>
        <div>{moment(testResults[0].retrievedDate).format("MMM Do YYYY, h:mm a")}</div>
      </Tooltip>
    );
  }

  function showPercentChangeTooltip(props) {
    return (
      <Tooltip id="percent-change-info" {...props}>
        <div>Daily percent change</div>
      </Tooltip>
    );
  }

  return (
    <div className="Home container">
      <h1 style={{ display: "inline-block" }}>Current Cases</h1>
      <OverlayTrigger placement="top" overlay={showRetrievedDate}>
        <span className="align-top text-muted" style={{ opacity: "0.8" }}>
          <FontAwesomeIcon icon="info-circle" size="sm" />
        </span>
      </OverlayTrigger>

      {
        isLoading &&
        <div className="spinner-wrap">
          <div className="spinner-border text-success spinner" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      }

      <div className="row">
        {!isLoading && getCurrentPositive(testResults)}
      </div>

      <div className="row">
        {!isLoading && getCurrentSecondary(testResults)}
      </div>

      <div className="row">
        <div className="col-12 col-md-8">
          {!isLoading && <InfectionRateChart range={7} />}
        </div>
      </div>

      <div className="my-3">
        {!isLoading && <small className="text-muted">Data from <a target="_blank" rel="noopener noreferrer" href="https://coronavirus.health.ok.gov/">Oklahoma State Department of Health</a></small>}
      </div>
    </div>
  );
}
