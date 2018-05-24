# You need to create a js file called development.js

You will need to set up API keys on your Bittrex.com account.  

Login to your Bittrex account and navigate to: https://bittrex.com/Manage?view=api

Add a new API key.

Copy the code below and fill in your new API key information.  

```javascript

module.exports = {

  /** Bittrex */
  btrx_api_key: 'your_api_key',
  btrx_secret_key: 'your_secret_key',
  
}

```

### NOTE: This will be ignored when you commit as long as you DO NOT mess with the .gitignore file. 

# If you fuck it up and commit your secret API key for all the world to see on Github and some hacker steals all of your Bitcoins (and / or other cryptocurrency) it is 100% your fault.

Serenity now...

# Run the following commands in your terminal

### Install node packages by running...

```
$ npm install
```

### Wait for npm install to complete then run the following command...

```
$ node bittrex-websocket.js
```

### Your console will show public updates for the market you have specified on line 12
### Your console will also show private updates for any OPEN ORDERS you have for the market you have specified on line 12

```javascript

let market = 'BTC-ETH'

// Note that the market is the reverse of the symbol separated by a dash. 
// Example: BTC/USDT = USDT-BTC; ZCL/BTC = BTC-ZCL

```