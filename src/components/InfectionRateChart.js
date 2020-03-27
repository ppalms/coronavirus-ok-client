import React, { useState, useEffect } from 'react';
import { API } from 'aws-amplify';
import '../../node_modules/react-vis/dist/style.css';
import { XYPlot, LineMarkSeries, XAxis, YAxis } from 'react-vis';
import moment from 'moment';

export default function InfectionRateChart(props) {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [maxCount, setMaxCount] = useState(100);

  useEffect(() => {
    async function onLoad() {
      if (!isLoading) {
        return;
      }

      try {
        const results = await loadTestResults();
        setTestResults(results);

        if (testResults.length > 0) {
          const counts = testResults.map(result => parseInt(result.y));
          const maxCount = Math.ceil((Math.max(...counts) + 1) / 10) * 10;
          setMaxCount(maxCount);
        }
      } catch (e) {
        console.error(e);
      }

      setIsLoading(false);
    }

    onLoad();
  });

  async function loadTestResults() {
    let results = await API.get("results", "/listResults");

    return results
      .filter(result => result.resultType === 'Positive (In-State)')
      .sort((a, b) => new Date(a.retrievedDate) - new Date(b.retrievedDate))
      .map(result => {
        return {
          x: result.retrievedDate,
          y: result.count,
        }
      });
  }

  return (
    <div className="InfectionRateChart mx-auto mt-3">
      <h5 className="text-center">7-Day Trend</h5>

      <XYPlot height={300} width={400} xType='ordinal' yDomain={[0, maxCount]}>
        <LineMarkSeries data={testResults
          .slice(testResults.length - props.range, testResults.length)} />
        <XAxis tickLabelAngle={-30} tickFormat={date => moment(date).format("MM/DD")} />
        <YAxis title="Total cases" />
      </XYPlot>
    </div>
  );
}
