const HDWalletProvider = require("truffle-hdwallet-provider");

// replace with real values when using
var mnemonic = "mountains supernatural ...";
var provider = "https://kovan.infura.io/v3/02e ...";

module.exports = {
    migrations_directory: "./migrations",
    networks: {
        "mainnet-infura": {
            provider: () => new HDWalletProvider(mnemonic, provider),
            network_id: 1,
            gas: 4700000
        }
    },
    solc: {
        optimizer: {
            enabled: true,
            runs: 500
        }
    }
};
