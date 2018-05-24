# You will need to create a js file called development.js

You will need to set up API keys on your Bittrex.com account.  

Login to your Bittrex account and navigate to: https://bittrex.com/Manage?view=api

Add a new API key.

Copy the code below and paste it into your new development.js file 

```javascript

module.exports = {

  /** Bittrex */
  btrx_api_key: 'your_api_key',
  btrx_secret_key: 'your_secret_key',
  
}

```

Next fill in your new API key information where it says 'your_api_key' and 'your_secret_key'.  


### NOTE: Your development.js file will be ignored when you commit as long as you DO NOT alter with the .gitignore file. 


...


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

let market = 'USDT-BTC'

// Note that the market is the reverse of the symbol separated by a dash. 
// Example: BTC/USDT = USDT-BTC; ZCL/BTC = BTC-ZCL

```

### Now go kick some ass and make a shit-ton of profit :)