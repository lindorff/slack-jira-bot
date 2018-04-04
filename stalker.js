const { RTMClient } = require('@slack/client');
const request = require('request-promise-native');
const config = require('./config.json');

// An access token (from your Slack app or custom integration - usually xoxb)
const slackToken = config.slackToken;
const jiraAuth = {
  user: config.jiraUser,
  pass: config.jiraPass
} 

const rtm = new RTMClient(slackToken);
rtm.start();
console.log('Starting bot');

rtm.on('message', (message) => {
  // Skip messages that are from a bot. We don't want this bot to react to messages from other bots.
  if ( (message.subtype && message.subtype === 'bot_message') ) {
    return;
  }

  const jiraTicketIdRegEx = /GIIT-\d+/g;
  const jiraTickets = message.text.match(jiraTicketIdRegEx);

  if(jiraTickets) {
    jiraTickets.forEach(postJiraDataToSlack(message.channel));
  }
});

const postJiraDataToSlack = channelId => async(jiraTicketId) => {
  try {
    const issueDetails = JSON.parse(
      await request(`https://jira.lindorff.com/rest/api/2/issue/${jiraTicketId}`, { auth: jiraAuth })
    );

    rtm.sendMessage(getJiraTicketInfoIntoString(issueDetails), channelId);
  } catch(err) {
    console.log(`Error fetching Jira issue ${jiraTicketId} : ` + err);
  }
}

function getJiraTicketInfoIntoString(issue) {
  return issue.key + " " + issue.fields.summary + " status: " + issue.fields.status.name;
}