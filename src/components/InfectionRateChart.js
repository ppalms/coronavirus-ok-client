import React, { useState, useEffect } from 'react';
import { API } from 'aws-amplify';
import '../../node_modules/react-vis/dist/style.css';
import { FlexibleWidthXYPlot, LineMarkSeries, XAxis, YAxis, Hint } from 'react-vis';
import moment from 'moment';

export default function InfectionRateChart(props) {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [maxCount, setMaxCount] = useState(100);
  const [hoverValue, setHoverValue] = useState(false);

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
    let results = await API.get("results", "/listResultsStatewide");

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
    <div className="InfectionRateChart mx-auto mt-5">
      <h3 className="text-center">7-Day Trend</h3>
      <FlexibleWidthXYPlot height={300} xType='ordinal' yDomain={[0, maxCount]}>
        <LineMarkSeries data={testResults
          .slice(testResults.length - props.range, testResults.length)}
          style={{ strokeWidth: '3px' }}
          size={window.innerWidth <= 760 ? "8" : "5"}
          onValueMouseOver={(datapoint, _event) => setHoverValue(datapoint)}
          onValueMouseOut={_ => setHoverValue(false)}
        />
        <XAxis tickLabelAngle={-30} tickFormat={date => moment(date).format("MM/DD")} />
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
