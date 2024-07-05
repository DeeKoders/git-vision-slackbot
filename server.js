const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get("/test", (req, res) => {
  console.log(process.env);
  res.send("Test Passed");
});

app.post("/github-webhook", (req, res) => {
  const { action, pull_request } = req.body;

  if (!pull_request) {
    return res.status(200).send("Webhook received but no action taken");
  }

  const prTitle = pull_request.title;
  const prUrl = pull_request.html_url;

  let message;

  if (action === "opened") {
    message = `New Pull Request: *${prTitle}* - ${prUrl}`;
  } else if (action === "closed" && pull_request.merged) {
    message = `Pull Request Merged: *${prTitle}* - ${prUrl}`;
  }

  if (message) {
    axios
      .post(process.env.SLACK_WEBHOOK_URL, {
        text: message,
      })
      .then((response) => {
        res.status(200).send("Webhook received and message sent to Slack");
      })
      .catch((error) => {
        console.error("Error sending message to Slack:", error);
        res.status(500).send("Error sending message to Slack");
      });
  } else {
    res.status(200).send("Webhook received but no action taken");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
