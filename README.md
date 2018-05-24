# You need to create a js file called development.js

You will need to set this up on your Bittrex.com account.  Copy the code below and fill in your information.  This will be ignored when you commit.

```javascript

module.exports = {

  /** Bittrex */
  btrx_api_key: 'your_api_key',
  btrx_secret_key: 'your_secret_key',

  /** User */
  user_name: 'your_user_name',
  call_sign: 'your_call_sign', // Watch the movie Top Gun if you do not understand this ;)

}

```

# Run the following commands in your terminal


## Install node packages by running...

```
$ npm install
```

## Wait for npm install to complete then run the following command...

```
$ node bittrex-websocket.js
```

### Your terminal will show public updates for the market you have specified on line 12

```javascript

let market = 'BTC-ETH' //or, BTC-ZCL, BTC-ADA, USDT-BTC, USDT-ETH, etc...
```