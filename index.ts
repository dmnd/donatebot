require("dotenv").config();
const Twitter = require("twitter-lite");

const entryPoint = "1266401790230069248";

async function main() {
  const user = new Twitter({
    consumer_key: process.env.API_KEY,
    consumer_secret: process.env.API_SECRET_KEY,
  });

  const response = await user.getBearerToken();

  const app = new Twitter({
    bearer_token: response.access_token,
  });

  const result = await app.get(`statuses/show/${entryPoint}`);
  console.log(result);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

// ???
export {};
