import React, { useState, useEffect } from 'react';
import moment from 'moment';
import './InfectionRateGrid.css';

export default function InfectionRateGrid(props) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const POSITIVE_RESULT_TYPES = ['Positive (In-State)', 'Cases'];

  useEffect(() => {
    async function onLoad() {
      if (!isLoading) {
        return;
      }

      try {
        setData(props.data.filter(x =>
          POSITIVE_RESULT_TYPES.includes(x.resultType) || x.resultType === 'Deaths'
        ));
      } catch (e) {
        console.error(e);
      }

      setIsLoading(false);
    }

    onLoad();
  });

  const buildGrid = data => {
    let dailyData = data
      .sort((a, b) => new Date(a.retrievedDate) - new Date(b.retrievedDate))
      .reduce((prev, curr) => {
        let day = prev.find(x => x && x.key === curr.retrievedDate);
        if (day) {
          day.values.push({ resultType: curr.resultType, count: curr.count });
        } else {
          prev.push({ key: curr.retrievedDate, values: [curr] });
        }

        return prev;
      }, [])
      .slice(-7);

    console.log(dailyData);

    return (
      <div className="row row-cols-7">
        {dailyData.map((day) => buildGridSquare(day))}
      </div>
    );
  }

  const buildGridSquare = day =>
    <div className="col-6 col-sm-4 p-1" key={day.key}>
      <table className="table table-sm table-borderless shadow-sm">
        <thead>
          <tr className="bg-info text-light">
            <th scope="col" colSpan="2">{moment(day.key).format("ddd MMM D")}</th>
          </tr>
        </thead>
        <tbody>
          {day.values
            .sort(sortResults)
            .map(result =>
              <tr key={result.resultType}>
                <td>{translateResultType(result.resultType)}</td>
                <td className="text-right">{result.count}</td>
              </tr>
            )}
        </tbody>
      </table>
    </div>

  const sortResults = (a, _b) =>
    POSITIVE_RESULT_TYPES.includes(a.resultType) ? -1 : 1;

  const translateResultType = resultType =>
    POSITIVE_RESULT_TYPES.includes(resultType) ? 'Cases' : resultType;

  return (
    <div className="InfectionRateGrid">
      {!isLoading && buildGrid(data)}
    </div>
  );
}
