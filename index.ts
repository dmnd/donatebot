require("dotenv").config();
const Twitter = require("twitter-lite");

const hasTwoReplies = "1274481754255081474";
const entryPoint = hasTwoReplies;

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

async function getReplies(app: any, tweet: Tweet): Promise<Array<Tweet>> {
  const response = await app.get("search/tweets", {
    q: `to:${tweet.user.screen_name}`,
  });
  return response.statuses.filter(
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

async function main() {
  const user = new Twitter({
    consumer_key: process.env.API_KEY,
    consumer_secret: process.env.API_SECRET_KEY,
  });

  const response = await user.getBearerToken();

  const app = new Twitter({
    bearer_token: response.access_token,
  });

  const tweet = await app.get(`statuses/show/${entryPoint}`);

  const thread = await getThread(app, tweet);
  printThread(thread);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

// ???
export {};
