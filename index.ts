import Twitter from "twitter-lite";

const entryPoint = "1266401790230069248";
console.log(entryPoint);

const user = new Twitter({
  consumer_key: "abc",
  consumer_secret: "def",
});

const response = await user.getBearerToken();
console.log(response);

// const app = new Twitter({
//   bearer_token: response.access_token,
// });
