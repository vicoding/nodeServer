var data = require("./data");

var express = require("express");
var app = express.createServer();
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("view options", { layout: false });

app.get("/", function (request, response) {
    response.render("index");
});

app.get("/user/:id", function (request, response) {
    var id = request.params.id;
    console.log(id);
    response.json(data[id]);
});


var Web3 = require("web3");
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var version = web3.version.api;
console.log(version); // "0.2.0"
var accounts = web3.eth.accounts;
console.log(accounts);

var tokenSource = 'contract Token {     address issuer;     mapping (address => uint) balances;      event Issue(address account, uint amount);     event Transfer(address from, address to, uint amount);      function Token() {         issuer = msg.sender;     }      function issue(address account, uint amount) {         if (msg.sender != issuer) throw;         balances[account] += amount;     }      function transfer(address to, uint amount) {         if (balances[msg.sender] < amount) throw;          balances[msg.sender] -= amount;         balances[to] += amount;          Transfer(msg.sender, to, amount);     }      function getBalance(address account) constant returns (uint) {         return balances[account];     } }';

var tokenCompiled = web3.eth.compile.solidity(tokenSource);
var code = tokenCompiled.Token.code;
console.log(code);


var abi = tokenCompiled.Token.info.abiDefinition;
console.log(abi);

var contract = web3.eth.contract(tokenCompiled.Token.info.abiDefinition);

var initializer = {from: web3.eth.accounts[0], data: tokenCompiled.Token.code, gas: 300000};


var callback = function(e, contract){
    if(!e) {
      if(!contract.address) {
        console.log("Contract transaction send: TransactionHash: " + contract.transactionHash + " waiting to be mined...");
      } else {
        console.log("Contract mined!");
        console.log(contract);
      }
    }
};
var token = contract.new(initializer, callback);

console.log(token);

app.get("/getXCoin",function(request,response){
     var myMoney = token.getBalance(web3.eth.accounts[0]);
     response.json("你账户上的XCoin余额是："+myMoney+"元");
});

app.get("/changeMoney",function(request,response){
    token.issue.sendTransaction(web3.eth.accounts[0], 100, {from: web3.eth.accounts[0]});
    response.json("great");
});

app.listen(8888);
