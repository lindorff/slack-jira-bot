const { RTMClient } = require('@slack/client');
const request = require('request-promise-native');
const config = require('./config.json');
const fs = require('fs');

// An access token (from your Slack app or custom integration - usually xoxb)
const slackToken = config.slackToken;

//OAuth parameter names found from here https://github.com/request/request#oauth-signing
const jiraOAuth = {
  consumer_key: config.jiraConsumerKey, 
  private_key: fs.readFileSync(config.jiraPrivateKeyFile, 'utf8'), 
  token: config.jiraToken, 
  token_secret: config.jiraTokenSecret,
  signature_method: 'RSA-SHA1'
}
const projects = config.projects;

const rtm = new RTMClient(slackToken);
rtm.start();
console.log('Starting bot');

rtm.on('message', (message) => {
  // Skip messages that are from a bot. We don't want this bot to react to messages from other bots.
  if ( (message.subtype && message.subtype === 'bot_message') ) {
    return;
  }

  if(!message.text) {
    //Slack sends events with null text when using threads. Let's just ignore those.
    return;
  }

  const jiraTicketIdRegEx = new RegExp(regExpForProjects(projects) + '-\\d+', 'g');
  const jiraTickets = message.text.match(jiraTicketIdRegEx);

  //Thread is formed based on timestamp. If we don't have thread already let's create one using original messages timestamp
  const threadTs = message.thread_ts || message.ts;

  if(jiraTickets) {
    jiraTickets.forEach(postJiraDataToSlack(message.channel, threadTs));
  }
});

function regExpForProjects(projects) {
  if(!projects || projects.length == 0) {
    throw new Error("No projects configured");
  }
  
  const projectsRegExp = projects
    .map(project => `(${project})`)
    .join('|');  
    
  return `(${projectsRegExp})`;  
}

const postJiraDataToSlack = (channelId, threadTs) => async(jiraTicketId) => {
  try {
    const issueDetails = JSON.parse(
      await request(`https://jira.lindorff.com/rest/api/2/issue/${jiraTicketId}`, { oauth: jiraOAuth })
    );

    const text = getJiraTicketInfoIntoString(issueDetails);
    
    rtm.addOutgoingEvent(true, 'message', { text: text, channel: channelId, thread_ts: threadTs });
  } catch(err) {
    console.log(`Error fetching Jira issue ${jiraTicketId} : ` + err);
  }
}

function getJiraTicketInfoIntoString(issue) {
  return `${issue.key} ${issue.fields.summary} status: ${issue.fields.status.name}`;
}

module.exports = {
  regExpForProjects: regExpForProjects
}