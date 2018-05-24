const signalR = require('signalr-client')
const zlib = require('zlib')
const crypto = require('crypto')
const _ = require('lodash')
const log = require('ololog')
  .configure({
    locate: false
  }) // console.log() in colors

const client = new signalR.client('wss://beta.bittrex.com/signalr', ['c2'])

let market = 'USDT-BTC'

let keys
if (process.env.NODE_ENV === 'production') {
  keys = require('./production')
} else {
  keys = require('./development')
}

const btrx_params = {
  'apiKey': keys.btrx_api_key,
  'secret': keys.btrx_secret_key,
  'nonce': function () {
    return this.milliseconds()
  }
}

/** Bittrex Credentials */
const api_key = btrx_params.apiKey
const secret_key = btrx_params.secret

/** Authentication Signature Function */
function signature(secret_key, challenge) {
  return crypto.createHmac('sha512', secret_key)
    .update(challenge)
    .digest('hex')
}

/** Websocket On Update Functions */
function on_public(__update) {
  let raw = new Buffer.from(__update, 'base64')
  zlib.inflateRaw(raw, function(err, inflated) {
    if (!err) {
      let obj = JSON.parse(inflated.toString('utf8'))
      if (obj.f) {
        log.lightGray('uE update...', JSON.stringify(obj))
      } else {
        let current_market = _.filter(obj.D, function(__obj) {
          return __obj.M === market
        })
        if (current_market.length > 0) {
          const summary = summary_current_market(current_market[0])
          log.lightBlue('uS update...', JSON.stringify(summary))
        }
      }
    }
  })
}

function on_private(__update) {
  let raw = new Buffer.from(__update, 'base64')
  zlib.inflateRaw(raw, function(err, inflated) {
    if (!err) {
      let obj = JSON.parse(inflated.toString('utf8'))
      if (obj.o) {
        /** Order Updates */
        let order = updated_order(obj)
        if (order.side === 'buy') {
          log.blue('buy_order_update', JSON.stringify(order, null, 2))
        } else if (order.side === 'sell') {
          log.lightRed('sell_order_update', JSON.stringify(order, null, 2))
        }
      } else {
        /** Balance Updates */
        let balance = updated_balance(obj.d)
        log.green('updated_balance', JSON.stringify(balance, null, 2))
      }
    }
  })
}

/** Websocket Client Connect */
client.serviceHandlers.connected = function(connection) {

  console.log('connected')

  /** Authentication Context */
  client.call('c2', 'GetAuthContext', api_key)
    .done(function(err, challenge) {
      if (err) {
        log.red(err)
      }

      /** Signature */
      const signed_challenge = signature(secret_key, challenge)

      /** Authenticate */
      client.call('c2', 'Authenticate', api_key, signed_challenge)
        .done(function(auth_err, auth_result) {
          if (auth_err) {
            log.red('auth_ERROR', auth_err)
          }
          log.yellow('auth_result', auth_result)

          /** Balance Updated */
          client.on('c2', 'uB', on_private)

          /** Order Update */
          client.on('c2', 'uO', on_private)

          /** Exchange Update */
          client.call('c2', 'SubscribeToExchangeDeltas', market)
            .done(function(err, result) {
              if (err) {
                return console.error(err)
              }
              if (result === true) {
                client.on('c2', 'uE', on_public)
              }
            })

          /** Summary Update */
          client.call('c2', 'SubscribeToSummaryDeltas')
            .done(function(err, result) {
              if (err) {
                return console.error(err)
              }
              if (result === true) {
                client.on('c2', 'uS', on_public)
              }
            })
        })
    })

}

/** Response Formatting Helper Functions */
function updated_order(__order)  {

  const map = _.map([__order], function(__obj) {

    const order = __obj.o

    const info = _.mapKeys(order, function(__val, __key) {
      let key_long = map_keys(__key)
      return key_long
    })

    return {
      status: status(__obj.TY),
      amount: __obj.o.Q,
      remaining: __obj.o.q,
      price: __obj.o.X,
      average: __obj.o.PU,
      uuid: __obj.o.U,
      id: __obj.o.OU,
      market_name: __obj.o.E,
      symbol: symbol(__obj.o.E),
      side: side(__obj.o.OT),
      info: info
    }

  })

  return map[0]

}

function updated_balance(__balance) {
  return _.mapKeys(__balance, function(__val, __key) {
    let key_long = map_keys(__key)
    return key_long
  })
}

function summary_current_market(__summary) {
  return _.mapKeys(__summary, function(__val, __key) {
    let key_long = map_keys(__key)
    return key_long
  })
}

function symbol (__market) {
  let split = __market.split('-')
  let base = split[0]
  let comp = split[1]
  return comp + '/' + base
}

function side(__order_type) {
  if (__order_type === 'LIMIT_BUY') {
    return 'buy'
  } else if (__order_type === 'LIMIT_SELL') {
    return 'sell'
  }
}

function status(__id) {
  const types = [{
    id: 0,
    status: 'open'
  }, {
    id: 1,
    status: 'partial'
  }, {
    id: 2,
    status: 'fill'
  }, {
    id: 3,
    status: 'cancel'
  }]
  let filter = types.filter(function(__obj) {
    return __obj.id === __id
  })
  return filter[0].status
}

function map_keys(__key) {
  const min_keys = [
    {
      key: 'A',
      val: 'Ask'
    },
    {
      key: 'a',
      val: 'Available'
    },
    {
      key: 'B',
      val: 'Bid'
    },
    {
      key: 'b',
      val: 'Balance'
    },
    {
      key: 'C',
      val: 'Closed'
    },
    {
      key: 'c',
      val: 'Currency'
    },
    {
      key: 'D',
      val: 'Deltas'
    },
    {
      key: 'd',
      val: 'Delta'
    },
    {
      key: 'E',
      val: 'Exchange'
    },
    {
      key: 'e',
      val: 'ExchangeDeltaType'
    },
    {
      key: 'F',
      val: 'FillType'
    },
    {
      key: 'f',
      val: 'Fills'
    },
    {
      key: 'G',
      val: 'OpenBuyOrders'
    },
    {
      key: 'g',
      val: 'OpenSellOrders'
    },
    {
      key: 'H',
      val: 'High'
    },
    {
      key: 'h',
      val: 'AutoSell'
    },
    {
      key: 'I',
      val: 'Id'
    },
    {
      key: 'i',
      val: 'IsOpen'
    },
    {
      key: 'J',
      val: 'Condition'
    },
    {
      key: 'j',
      val: 'ConditionTarget'
    },
    {
      key: 'K',
      val: 'ImmediateOrCancel'
    },
    {
      key: 'k',
      val: 'IsConditional'
    },
    {
      key: 'L',
      val: 'Low'
    },
    {
      key: 'l',
      val: 'Last'
    },
    {
      key: 'M',
      val: 'MarketName'
    },
    {
      key: 'm',
      val: 'BaseVolume'
    },
    {
      key: 'N',
      val: 'Nonce'
    },
    {
      key: 'n',
      val: 'CommissionPaid'
    },
    {
      key: 'O',
      val: 'Orders'
    },
    {
      key: 'o',
      val: 'Order'
    },
    {
      key: 'P',
      val: 'Price'
    },
    {
      key: 'p',
      val: 'CryptoAddress'
    },
    {
      key: 'Q',
      val: 'Quantity'
    },
    {
      key: 'q',
      val: 'QuantityRemaining'
    },
    {
      key: 'R',
      val: 'Rate'
    },
    {
      key: 'r',
      val: 'Requested'
    },
    {
      key: 'S',
      val: 'Sells'
    },
    {
      key: 's',
      val: 'Summaries'
    },
    {
      key: 'T',
      val: 'TimeStamp'
    },
    {
      key: 't',
      val: 'Total'
    },
    {
      key: 'U',
      val: 'Uuid'
    },
    {
      key: 'u',
      val: 'Updated'
    },
    {
      key: 'V',
      val: 'Volume'
    },
    {
      key: 'W',
      val: 'AccountId'
    },
    {
      key: 'w',
      val: 'AccountUuid'
    },
    {
      key: 'X',
      val: 'Limit'
    },
    {
      key: 'x',
      val: 'Created'
    },
    {
      key: 'Y',
      val: 'Opened'
    },
    {
      key: 'y',
      val: 'State'
    },
    {
      key: 'Z',
      val: 'Buys'
    },
    {
      key: 'z',
      val: 'Pending'
    },
    {
      key: 'CI',
      val: 'CancelInitiated'
    },
    {
      key: 'FI',
      val: 'FillId'
    },
    {
      key: 'DT',
      val: 'OrderDeltaType'
    },
    {
      key: 'OT',
      val: 'OrderType'
    },
    {
      key: 'OU',
      val: 'OrderUuid'
    },
    {
      key: 'PD',
      val: 'PrevDay'
    },
    {
      key: 'TY',
      val: 'Type'
    },
    {
      key: 'PU',
      val: 'PricePerUnit'
    }
  ]
  return _.filter(min_keys, function(__obj) {
    return __obj.key === __key
  })[0].val
}