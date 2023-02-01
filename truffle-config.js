module.exports = {
  mocha: {},
  compilers: {
    solc: {
      version: "0.8.17"
    }
  },
  networks: {
    loc_cryptocar_cryptocar: {
      network_id: "*",
      port: 7071,
      host: "127.0.0.1"
    },
    loc_development_development: {
      network_id: "*",
      port: 7071,
      host: "127.0.0.1"
    }
  }
};
