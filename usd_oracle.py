import urllib
from requests import * 
from web3 import Web3, HTTPProvider, IPCProvider
import json
import csv
import rlp 


#below 3 oracle pricing functions serve as updated pegs to the solidity contract which allows updates from oracle address
#oracles wouldn't be needed for final version of synthetic assets 

#stop loss orders match limit buy orders in this translation 
#limit orders can't match each other types since market maker is solidity code and not order books
#unfilled market order becomes a limit order at that price or filled at the next lowest price change
#we should charge for maker orders and takers are free. this gives a lot of incentive for liquidity, something to thing about
#changes the _price variable of the synthetic stock smart contract to the calcuated ether price of the asset

#gives the price for the update of the synthetic price smart contract

def OraclePricing():
	kraken_usd = 'https://api.kraken.com/0/public/Ticker?pair=ETHUSD'

	gdax_usd = 'https://api.gdax.com/products/ETH-USD/ticker'

	reference_stock_ticker = "SNAP"
	reference_stock_price = "http://finance.yahoo.com/d/quotes.csv?s=" + reference_stock_ticker + "&f=l1&e=.csv"
	reference_stock_price = urllib.request.urlopen(reference_stock_price).read().strip()

	kraken_json = urllib.request.urlopen(kraken_usd).read()
	real_kraken_json = json.loads(kraken_json)
	parsed_kraken_price = real_kraken_json['result']['XETHZUSD']['a'][0]

	gdax_json = urllib.request.urlopen(gdax_usd).read()
	real_gdax_json = json.loads(gdax_json)
	parsed_gdax_price = real_gdax_json['bid']


	average_ETH_price = (float(parsed_kraken_price) + float(parsed_gdax_price))/2

	USD_price_of_reference_stock = float(reference_stock_price)

	synthetic_stock_price_in_ETH = USD_price_of_reference_stock/average_ETH_price

	return synthetic_stock_price_in_ETH


def USDOraclePricing():
	kraken_usd = 'https://api.kraken.com/0/public/Ticker?pair=ETHUSD'

	gdax_usd = 'https://api.gdax.com/products/ETH-USD/ticker'

	kraken_json = urllib.request.urlopen(kraken_usd).read()
	real_kraken_json = json.loads(kraken_json)
	parsed_kraken_price = real_kraken_json['result']['XETHZUSD']['a'][0]

	gdax_json = urllib.request.urlopen(gdax_usd).read()
	real_gdax_json = json.loads(gdax_json)
	parsed_gdax_price = real_gdax_json['bid']


	average_ETH_price = (float(parsed_kraken_price) + float(parsed_gdax_price))/2

	synthetic_stock_price_in_ETH = average_ETH_price #for synthetic USD we literally only need average ETH price

	return synthetic_stock_price_in_ETH

def WheatOraclePricing():
	kraken_usd = 'https://api.kraken.com/0/public/Ticker?pair=ETHUSD'

	gdax_usd = 'https://api.gdax.com/products/ETH-USD/ticker'

	reference_stock_ticker = "WEAT"
	reference_stock_price = "http://finance.yahoo.com/d/quotes.csv?s=" + reference_stock_ticker + "&f=l1&e=.csv"
	reference_stock_price = urllib.request.urlopen(reference_stock_price).read().strip()

	kraken_json = urllib.request.urlopen(kraken_usd).read()
	real_kraken_json = json.loads(kraken_json)
	parsed_kraken_price = real_kraken_json['result']['XETHZUSD']['a'][0]

	gdax_json = urllib.request.urlopen(gdax_usd).read()
	real_gdax_json = json.loads(gdax_json)
	parsed_gdax_price = real_gdax_json['bid']


	average_ETH_price = (float(parsed_kraken_price) + float(parsed_gdax_price))/2

	USD_price_of_reference_stock = float(reference_stock_price)

	synthetic_stock_price_in_ETH = USD_price_of_reference_stock/average_ETH_price

	return synthetic_stock_price_in_ETH


web3 = Web3(HTTPProvider('http://localhost:8545'))
#web3 = Web3(IPCProvider()) for some reason this fucks up everything with sockets breaking, wtf piper??
print(web3.eth.blockNumber)

web3.eth.defaultAccount = '0x58E813a165687301E76606Cf912fA4d0bdcc6727'

synthetic_asset_contract = web3.eth.contract()

abi = json.loads('[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"oracle","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"price","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"buy","outputs":[{"name":"ok","type":"bool"}],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"_price","type":"uint256"}],"name":"peg","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"sell","outputs":[{"name":"ok","type":"bool"}],"payable":false,"type":"function"},{"inputs":[{"name":"_name","type":"string"},{"name":"_symbol","type":"string"},{"name":"_price","type":"uint256"},{"name":"_totalSupply","type":"uint256"},{"name":"_oracle","type":"address"}],"payable":false,"type":"constructor"},{"payable":true,"type":"fallback"}]')



synthetic_asset_contract_address = "0xf84dbc80e38410135c23c0d48947ce506755c4ec" # sSNAP
synthetic_asset_contract_address2 = "0xb0824f0d55caf7b5f19dd08de340703a04bacdf6" # sWEAT
synthetic_asset_contract_address3 = "0xe97213ffcec4d93e171943ee57f4af5e90d6e2fe" # sUSD


c = web3.eth.contract(abi, synthetic_asset_contract_address)
c2 = web3.eth.contract(abi, synthetic_asset_contract_address2)
c3 = web3.eth.contract(abi, synthetic_asset_contract_address3)
web3.personal.unlockAccount(web3.eth.accounts[0], 'password')

wei_per_ppm_synthetic_asset = int(OraclePricing() * 1e12)
wei_per_ppm_synthetic_asset2 = int(WheatOraclePricing() * 1e12)
wei_per_ppm_synthetic_asset3 = int(USDOraclePricing() * 1e12)

c.transact({ 'from': web3.eth.accounts[0], 'value': 0 }).peg(wei_per_ppm_synthetic_asset)
c2.transact({ 'from': web3.eth.accounts[0], 'value': 0 }).peg(wei_per_ppm_synthetic_asset2)
c3.transact({ 'from': web3.eth.accounts[0], 'value': 0 }).peg(wei_per_ppm_synthetic_asset3)


