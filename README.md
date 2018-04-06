# slack-jira-bot

First call `npm install`, and then you can run the bot by calling `npm start`

## Configuring Slack 

Create your Slack App here https://api.slack.com/apps?new_app=1. Add bot user for that app. For this app to work you need scopes **bot** and **search:read**. You can add the scopes from OAuth & Permissions page. You will also get your *Bot User OAuth Access Token* from that page.  

## JIRA OAuth

You will need OAuth token for Jira to be able to use this bot. Access token can be created by following instructions from here https://developer.atlassian.com/server/jira/platform/oauth/  

In config file you have to configure four things. You find most of the values from the file **config.properties** that you can find from target directory of your Java project.

* **jiraToken**: access_token in _config.properties_
* **jiraTokenSecret**: secret in _config.properties_
* **jiraConsumerKey**: consumer_key in _config.properties_
* **jiraPrivateKeyFile**: Path to file containing private key in PEM format. If you followed instructions this should be in file called *jira_privatekey.pem*