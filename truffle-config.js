module.exports = {
  mocha: {},
  compilers: {
    solc: {
      version: "0.8.17"
    }
  },
  networks: {
    loc_development_development: {
      network_id: "*",
      port: 7545,
      host: "127.0.0.1"
    }
  }
};
