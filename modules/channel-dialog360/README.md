# Channel-Dialog360

### Prerequisite

- An HTTPS Endpoint to your bot
  - Set the externalUrl field in botpress.config.json
  - Create an HTTPS tunnel to your machine using Ngrok. Tutorial
  - Using Nginx and Let's Encrypt. Tutorial

- Create a Twilio account and create a phone number

### Steps

#### Get your API credentials

1. Go to you Dialog 360 console dashboard
2. Go to the settings tab
3. Scroll down and copy your API Key

#### Configure your bot

1. Edit data/bots/YOUR_BOT_ID/config/channel-dialog360.json (or create it) and set
- enabled: Set to true
- apiKey: Paste your api Key
2. Restart Botpress
3. You should see your webhook endpoint in the console on startup

#### Configure webhook

1. Go to the phone numbers section
2. Click on your registered phone number
3. Scroll down to the messaging webhook section
4. Set it to `EXTERNAL_URL/api/v1/bots/YOUR_BOT_ID/mod/channel-dialog360/webhook`
