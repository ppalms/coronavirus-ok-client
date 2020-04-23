import React, { useState, useEffect } from 'react';
import { API } from 'aws-amplify';
import '../../node_modules/react-vis/dist/style.css';
import { FlexibleWidthXYPlot, LineMarkSeries, XAxis, YAxis, Hint } from 'react-vis';
import moment from 'moment';

export default function InfectionRateChart(props) {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [yDomain, setYDomain] = useState({ min: 0, max: 100 });
  const [hoverValue, setHoverValue] = useState(false);

  const POSITIVE_RESULT_TYPES = ['Positive (In-State)', 'Cases'];

  useEffect(() => {
    async function onLoad() {
      if (!isLoading) {
        return;
      }

      try {
        let results = await loadTestResults();
        results = results.slice(results.length - props.range, results.length);
        setTestResults(results);

        if (testResults.length > 0) {
          const counts = testResults.map(result => parseInt(result.y));

          // Find the next greatest number divisible by 100
          const maxCount = Math.ceil((Math.max(...counts) + 1) / 100) * 100;

          const minCount = Math.min(...counts) - 100;

          setYDomain({ min: minCount, max: maxCount });
        }
      } catch (e) {
        console.error(e);
      }

      setIsLoading(false);
    }

    onLoad();
  });

  async function loadTestResults() {
    let results = await API.get("results", "/listCasesStatewide");

    return results
      .filter(result => POSITIVE_RESULT_TYPES.includes(result.resultType))
      .sort((a, b) => new Date(a.retrievedDate) - new Date(b.retrievedDate))
      .map(result => {
        return {
          x: result.retrievedDate,
          y: result.count,
        }
      });
  }

  return (
    <div className="InfectionRateChart mx-auto mt-5">
      <h2>7-Day Trend</h2>
      <FlexibleWidthXYPlot height={350} xType='ordinal' yDomain={[yDomain.min, yDomain.max]}>
        <LineMarkSeries data={testResults}
          style={{ strokeWidth: '3px' }}
          size={window.innerWidth <= 760 ? "8" : "5"}
          onValueMouseOver={(datapoint, _event) => setHoverValue(datapoint)}
          onValueMouseOut={_ => setHoverValue(false)}
        />
        <XAxis tickLabelAngle={-30} tickFormat={date => moment(date).format("MMM D")} />
        <YAxis title="Total cases" />
        {hoverValue &&
          <Hint value={hoverValue}>
            <small>
              <div className="bg-dark rounded text-center text-light p-2" style={{ opacity: 0.9 }}>
                <div><strong>{moment(hoverValue.x).format("MMM D")}</strong></div>
                <div>{hoverValue.y} cases</div>
              </div>
            </small>
          </Hint>
        }
      </FlexibleWidthXYPlot>
    </div>
  );
}
