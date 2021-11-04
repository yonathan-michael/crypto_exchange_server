// Server Initialization
const express = require("express");
const app = express();
var cors = require("cors");
app.use(cors());

// [Server State] Dynamic Data Structure to Hold Information For Client
var bitcoin_prices = {
	KuCoin_bidPrice: 0,
	KuCoin_askPrice: 0,
	Binance_bidPrice: 0,
	Binance_askPrice: 0,
};

var ethereum_prices = {
	KuCoin_bidPrice: 0,
	KuCoin_askPrice: 0,
	Binance_bidPrice: 0,
	Binance_askPrice: 0,
};

// KuCoin Connection/Configuration/Initialization
const api = require("kucoin-node-api");
const config = {
	environment: "live",
};
api.init(config);
const btc_symbol = "BTC-USDT";
const eth_symbol = "ETH-USDT";

// KuCoin Get Function / Updates Server State
async function KuCoinGetTicker(symbol) {
	try {
		let r = await api.getTicker(symbol);
		if (symbol === "BTC-USDT") {
			var bit_bid_price = parseFloat(
				parseFloat(r.data.bestBid).toFixed(2)
			);
			var bit_ask_price = parseFloat(
				parseFloat(r.data.bestAsk).toFixed(2)
			);
			bitcoin_prices["KuCoin_bidPrice"] = bit_bid_price;
			bitcoin_prices["KuCoin_askPrice"] = bit_ask_price;
		} else if (symbol === "ETH-USDT") {
			var eth_bid_price = parseFloat(
				parseFloat(r.data.bestBid).toFixed(2)
			);
			var eth_ask_price = parseFloat(
				parseFloat(r.data.bestAsk).toFixed(2)
			);
			ethereum_prices["KuCoin_bidPrice"] = eth_bid_price;
			ethereum_prices["KuCoin_askPrice"] = eth_ask_price;
		}
	} catch (err) {
		console.log(err);
	}
}

// Binance Connection/Initialization
const Binance = require("node-binance-api");
const binance = new Binance().options({
	APIKEY: "<key>",
	APISECRET: "<secret>",
});
const btc_binance_symbol = "BTCUSDT";
const eth_binance_symbol = "ETHUSDT";

// Retrieve Bitcoin Results
app.get("/bitcoin", (req, res) => {
	// Retrieve Bitcoin Information from KuCoin
	KuCoinGetTicker(btc_symbol);

	// Retrieve Bitcoin Information from Binance
	binance.bookTickers(btc_binance_symbol, (error, ticker) => {
		var bid_price = parseFloat(parseFloat(ticker.bidPrice).toFixed(2));
		var ask_price = parseFloat(parseFloat(ticker.askPrice).toFixed(2));
		bitcoin_prices["Binance_bidPrice"] = bid_price;
		bitcoin_prices["Binance_askPrice"] = ask_price;
	});

	res.status(200).json(bitcoin_prices).end();
});

// Retrieve Ethereum Results
app.get("/ethereum", (req, res) => {
	// Retrieve Ethereum Information from KuCoin
	KuCoinGetTicker(eth_symbol);

	// Retrieve Ethereum Information from Binance
	binance.bookTickers(eth_binance_symbol, (error, ticker) => {
		var bid_price = parseFloat(parseFloat(ticker.bidPrice).toFixed(2));
		var ask_price = parseFloat(parseFloat(ticker.askPrice).toFixed(2));
		ethereum_prices["Binance_bidPrice"] = bid_price;
		ethereum_prices["Binance_askPrice"] = ask_price;
	});

	res.status(200).json(ethereum_prices).end();
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`App listening on port ${PORT}`);
	console.log("Press Ctrl+C to quit.");
});
