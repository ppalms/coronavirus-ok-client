import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, Tooltip, OverlayTrigger } from "react-bootstrap";
import { API } from "aws-amplify";
import moment from "moment";
import "moment-timezone";
import "./Home.css";
import InfectionRateChart from "../components/InfectionRateChart";
import InfectionRateGrid from "../components/InfectionRateGrid";

export default function Home(props) {
  const [testResults, setTestResults] = useState({});
  const [confirmedChange, setConfirmedChange] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const POSITIVE_RESULT_TYPES = ['Positive (In-State)', 'Cases'];

  useEffect(() => {
    async function onLoad() {
      if (!isLoading) {
        return;
      }

      try {
        const { currentCases, allCases } = await loadData();
        const testResults = { currentCases: currentCases, allCases: allCases };
        setTestResults(testResults);
      } catch (e) {
        console.error(e);
      }

      setIsLoading(false);
    }

    onLoad();
  });

  async function loadData() {
    let currentCases = await getMostRecentResults();

    await calculateDailyChange(currentCases);

    const allCases = await API.get("results", "/listCasesStatewide");

    return { currentCases, allCases };
  }

  async function getMostRecentResults() {
    let today = moment().format();
    let results = await API.get("results", `/listCasesStatewide/${today}`);

    while (results.length === 0) {
      today = moment(today).subtract(1, 'day').format();
      results = await API.get("results", `/listCasesStatewide/${today}`);
    }

    return results;
  }

  const getCurrentConfirmed = results => results.find(r => POSITIVE_RESULT_TYPES.includes(r.resultType));

  async function calculateDailyChange(results) {
    const todayConfirmed = getCurrentConfirmed(results);

    const yesterday = moment(todayConfirmed.retrievedDate).subtract(1, 'day').format();
    const yesterdayResults = await API.get("results", `/listCasesStatewide/${yesterday}`);
    const yesterdayConfirmed = yesterdayResults.find(r => POSITIVE_RESULT_TYPES.includes(r.resultType));

    const change = ((todayConfirmed.count - yesterdayConfirmed.count) / yesterdayConfirmed.count * 100).toFixed(2);

    setConfirmedChange({ change: change, direction: change > 0 ? 'up' : 'down' });
  }

  function getCurrentPositive(currentCases) {
    const currentPositive = currentCases.find(r => POSITIVE_RESULT_TYPES.includes(r.resultType));

    return (
      <div key={currentPositive.resultType} className="col-md-8 pb-2">
        <Card className="h-100 shadow-sm pt-md-3">
          <Card.Body>
            <Card.Title>Confirmed</Card.Title>
            <Card.Text>
              <span className="display-3 text-danger d-block"><strong>{parseInt(currentPositive.count).toLocaleString()}</strong></span>
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

  const getResultTypeTitle = resultType => resultType.includes('Hospital')
    ? 'Hospitalized' : resultType;

  function getCurrentSecondary(currentCases) {
    const currentSecondary = currentCases.filter(r =>
      r.resultType === 'Deaths' || r.resultType.includes('Hospital'));

    return (
      <div className="col-md-4">
        {currentSecondary.map((result, _) =>
          <div key={result.resultType} className="pb-2">
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>{getResultTypeTitle(result.resultType)}</Card.Title>
                <Card.Text className="text-muted secondary-text"><strong>{result.count}</strong></Card.Text>
              </Card.Body>
            </Card>
          </div>
        )}
      </div>);
  }

  function showRetrievedDate(props) {
    return (
      <Tooltip id="updated-date-info" {...props}>
        <small>
          <div>Last updated:</div>
          <div>{moment(testResults.currentCases[0].retrievedDate).format("MMM Do YYYY, h:mm a")}.</div>
          <div>Hospitalization count is cumulative</div>
        </small>
      </Tooltip>
    );
  }

  function showPercentChangeTooltip(props) {
    return (
      <Tooltip id="percent-change-info" {...props}>
        <small>Daily percentage change</small>
      </Tooltip>
    );
  }

  return (
    <div className="Home container">
      {
        !isLoading &&
        <div>
          <p className="lead">The <a href="https://coronavirus.health.ok.gov/">Oklahoma Health Department</a> has updated their COVID-19 page to a dashboard view!</p>
          <p>This site is no longer being updated - please visit <a href="https://coronavirus.health.ok.gov/">https://coronavirus.health.ok.gov/</a>.</p>
        </div>
      }

      <div className="d-flex justify-content-center">
        <h1 className="d-inline-block">Current Cases</h1>
        <OverlayTrigger placement="top" overlay={showRetrievedDate}>
          <span className="text-muted" style={{ opacity: "0.8" }}>
            <FontAwesomeIcon icon="info-circle" size="sm" />
          </span>
        </OverlayTrigger>
      </div>

      {
        isLoading &&
        <div className="spinner-wrap">
          <div className="spinner-border text-success spinner" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      }

      <div className="d-flex flex-column flex-md-row align-items-stretch text-center">
        {!isLoading && getCurrentPositive(testResults.currentCases)}

        {!isLoading && getCurrentSecondary(testResults.currentCases)}
      </div>

      <div className="row">
        <div className="col-12 col-lg-8">
          {!isLoading && <InfectionRateChart range={7} />}
        </div>
        <div className="col-12 col-lg-4 mt-3 mt-lg-5">
          {!isLoading && <InfectionRateGrid data={testResults.allCases} />}
        </div>
      </div>

      <div className="my-3">
        {!isLoading && <small className="text-muted">Data from <a target="_blank" rel="noopener noreferrer" href="https://coronavirus.health.ok.gov/">Oklahoma State Department of Health</a></small>}
      </div>
    </div>
  );
}
