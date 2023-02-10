App = {
  web3Provider: null,
  contracts: {},

  init: async function() {

    return await App.initWeb3();
  },

  initWeb3: async function() {
    
        // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    
    web3 = new Web3(App.web3Provider);


    return App.initContract();
  },

  initContract: function() {
    
    $.getJSON('CryptoCar.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var CryptoCarArtifacts = data;
      App.contracts.CryptoCar = TruffleContract(CryptoCarArtifacts);
    
      // Set the provider for our contract
      App.contracts.CryptoCar.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted pets
      return App.loadCar();
    });

    return console.log("tornato da initCOntract")
    //return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  loadCar: function() {
    
    var cryptoCarInstance;

    App.contracts.CryptoCar.deployed().then(function(instance) {
      cryptoCarInstance = instance;

      return cryptoCarInstance.getCarList.call();
    }).then(function(data) {
      
          // Load .
      
      //$.getJSON('../cars.json', function(data) {
        var autoRow = $('#autoRow');
        var autoTemplate = $('#autoTemplate');

        for (i = 0; i < data.length; i ++) {
          autoTemplate.find('.panel-title').text(data[i].name);
          autoTemplate.find('img').attr('src', data[i].picture);
          autoTemplate.find('.auto-age').text(data[i].age_production);
          autoTemplate.find('.auto-model').text(data[i].modello);
          autoTemplate.find('.auto-price').text(data[i].prezzo);
          autoTemplate.find('.auto-mot').text(data[i].motorizzazione);
          autoTemplate.find('.btn-adopt').attr('data-id', data[i].id);
          autoRow.append(autoTemplate.html());
        }
      
      

      console.log(data); 
      /*
      
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    */
    });
    

  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }

    var account = accounts[0];

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;

      // Execute adopt as a transaction by sending account
      return adoptionInstance.adopt(petId, {from: account});
    }).then(function(result) {
      return App.markAdopted();
    }).catch(function(err) {
      console.log(err.message);
    });
  });

  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
