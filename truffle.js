const HDWalletProvider = require("truffle-hdwallet-provider");

// replace with real values when using
var mnemonic = "ivory debris hunt final organ index skill govern motion soft silver burden";
var provider = "https://mainnet.infura.io/v3/02e795aee1fb4e4dbd74eaacd542530a";

module.exports = {
    migrations_directory: "./migrations",
    networks: {
        "mainnet-infura": {
            provider: () => new HDWalletProvider(mnemonic, provider),
            network_id: 1,
            gas: 1700000,
            gasPrice: 3000000001
        }
    },
    solc: {
        optimizer: {
            enabled: true,
            runs: 500
        }
    }
};
