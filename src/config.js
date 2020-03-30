// const dev = {
//   apiGateway: {
//     REGION: "us-east-1",
//     URL: "https://tv5v3ho19f.execute-api.us-east-1.amazonaws.com/dev"
//   }
// };

const prod = {
  apiGateway: {
    REGION: "us-east-1",
    URL: "https://tv5v3ho19f.execute-api.us-east-1.amazonaws.com/prod"
  }
};

// const config = process.env.REACT_APP_STAGE === 'prod' ? prod : dev;
const config = prod;

export default {
  // Add common config values here
  ...config
};
