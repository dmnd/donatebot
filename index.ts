require("dotenv").config();
const Twitter = require("twitter-lite");

const hasTwoReplies = "1274481754255081474";
const lotsOfReplies = "1274029121820033026";

const entryPoint = lotsOfReplies;

type Thread = {
  tweet: Tweet;
  replies: Array<Thread>;
};

type Tweet = {
  created_at: string;
  text: string;
  user: { screen_name: string };
  in_reply_to_status_id_str: string;
  id_str: string;
};

function printTweet(tweet: Tweet, indent = 0) {
  const prefix = new Array(indent).fill(" ").join("");
  console.log(prefix + tweet.text);
  console.log(`${prefix}@${tweet.user.screen_name} on ${tweet.created_at}`);
  console.log();
}

const MAX_RESULTS_PER_PAGE = 100;

type SearchResponse = {
  statuses: Array<Tweet>;
};

async function search(app: any, options: any): Promise<SearchResponse> {
  return app.get("search/tweets", options);
}

async function getReplies(app: any, tweet: Tweet): Promise<Array<Tweet>> {
  const options = {
    q: `to:${tweet.user.screen_name}`,
    result_type: "recent",
    count: MAX_RESULTS_PER_PAGE,
  };

  const response = await search(app, options);
  let currentPage = response.statuses;
  let allReplies = currentPage;
  while (currentPage.length === MAX_RESULTS_PER_PAGE) {
    const nextResponse = await search(app, {
      ...options,
      max_id: currentPage[MAX_RESULTS_PER_PAGE - 1].id_str,
    });
    currentPage = nextResponse.statuses;
    allReplies = [...allReplies, ...currentPage];
  }

  return allReplies.filter(
    (t: Tweet) => t.in_reply_to_status_id_str === tweet.id_str
  );
}

async function getThread(app: any, tweet: Tweet): Promise<Thread> {
  const tweets = await getReplies(app, tweet);
  const replies: Array<Thread> = await Promise.all(
    tweets.map((tweet) => getThread(app, tweet))
  );

  return {
    tweet,
    replies,
  };
}

function printThread(thread: Thread, indent = 0) {
  printTweet(thread.tweet, indent);
  thread.replies.forEach((tweet) => {
    printThread(tweet, indent + 2);
  });
}

async function getApi(key: string, secret: string) {
  const user = new Twitter({
    consumer_key: key,
    consumer_secret: secret,
  });

  const response = await user.getBearerToken();

  const app = new Twitter({
    bearer_token: response.access_token,
  });

  return app;
}

function assertIsString(x: unknown): string {
  if (typeof x !== "string") {
    throw new Error();
  }
  return x;
}

async function showStatus(app: any, id: string): Promise<Tweet> {
  return app.get(`statuses/show/${id}`);
}

async function main() {
  const key = assertIsString(process.env.API_KEY);
  const secret = assertIsString(process.env.API_SECRET_KEY);
  const app = await getApi(key, secret);

  const tweet = await showStatus(app, entryPoint);
  const thread = await getThread(app, tweet);
  printThread(thread);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

// ???
export {};
