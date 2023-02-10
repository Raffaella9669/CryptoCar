module.exports = {
  mocha: {},
  compilers: {
    solc: {
      version: "0.8.17"
    }
  },
  networks: {
    development: {
      network_id: "*",
      port: 8545,
      host: "127.0.0.1"
    },
    loc_caar_caar: {
      network_id: "*",
      port: 8545,
      host: "127.0.0.1"
    }
  }
};
