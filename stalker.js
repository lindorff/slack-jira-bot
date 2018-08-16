/*
Copyright 2018 Lindorff Oy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const { RTMClient } = require('@slack/client');
const { WebClient } = require('@slack/client');
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
const web = new WebClient(slackToken);
rtm.start();
console.log('Starting bot');

rtm.on('message', (message) => {  
  // Skip messages that are from a bot. We don't want this bot to react to messages from other bots.
  if ( (message.subtype && message.subtype === 'bot_message') ) {
    return;
  }

  if(message.hidden) {
    //Slack sends events with null text when using threads. Let's just ignore those.
    return;
  }

  const jiraTicketIdRegEx = new RegExp(regExpForProjects(projects) + '-\\d+', 'g');
  const jiraTickets = message.text.match(jiraTicketIdRegEx);

  //Thread is formed based on timestamp. If we don't have thread already let's create one using original messages timestamp
  const threadTs = message.thread_ts || message.ts;

  if(jiraTickets) {
    const uniqueTickets = new Set(jiraTickets);
    uniqueTickets.forEach(postJiraDataToSlack(message.channel, threadTs));
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
    
    web.chat.postMessage({ text: text, channel: channelId, thread_ts: threadTs});
  } catch(err) {
    console.log(`Error fetching Jira issue ${jiraTicketId} : ` + err);
  }
}

function getJiraTicketInfoIntoString(issue) {
  return `<https://jira.lindorff.com/browse/${issue.key}|${issue.key}> ${issue.fields.summary} \n*Status*: ${issue.fields.status.name} `;
}

module.exports = {
  regExpForProjects: regExpForProjects
}