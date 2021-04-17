# webhook.gruppe-adler.de

A proxy for GitHub -> Discord webhooks, which automatically discards events from private repositories.

## Usage
If you want to add an webhook to github you just prepend `https://webhook.gruppe-adler.de/github?url=` to the webhook url.

So if your Discord webhook URL is `https://discordapp.com/api/webhooks/01/02/github` you have to add an GitHub webhook with the following url: `https://webhook.gruppe-adler.de/github?url=https://discordapp.com/api/webhooks/01/02/github`.
