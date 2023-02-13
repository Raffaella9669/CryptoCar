 
NewApp = {
    web3Provider: null,
    contracts: {},
    
  
    init: async function() {
  
      return await NewApp.initWeb3();
    },
  
    initWeb3: async function() {
      
          // Modern dNewapp browsers...
      if (window.ethereum) {
        NewApp.web3Provider = window.ethereum;
        try {
          // Request account access
          await window.ethereum.enable();
           
        } catch (error) {
          // User denied account access...
          console.error("User denied account access")
        }
      }
      // Legacy dNewapp browsers...
      else if (window.web3) {
        NewApp.web3Provider = window.web3.currentProvider;
      }
      // If no injected web3 instance is detected, fall back to Ganache
      else {
        NewApp.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      }
      
      web3 = new Web3(NewApp.web3Provider);
  
  
      return NewApp.initContract();
    },
  
    initContract: function() {
      

      $.getJSON('CarLedger.json', function(data) {
        // Get the necessary contract artifact file and instantiate it with @truffle/contract
        var LedgerArtifacts = data;
        NewApp.contracts.Ledger = TruffleContract(LedgerArtifacts);
      
        // Set the provider for our contract
        NewApp.contracts.Ledger.setProvider(NewApp.web3Provider);
      
        // Use our contract to retrieve and mark the adopted pets
        return NewApp.loadCar();
      });
  
      return NewApp.bindEvents();
    },
  
    bindEvents: function() {
      $(document).on('click', '.btn-buy', NewApp.handleAdopt);
    },
  
    loadCar: function() {
      
      var ledgerInstance;
  
      NewApp.contracts.Ledger.deployed().then(function(instance) {
        ledgerInstance = instance;

        web3.eth.getAccounts(function(error, accounts) {
          if (error) {
            console.log(error);
          }
          console.log(accounts); 
           
        }
        
        )
      
        return ledgerInstance.getCarsbyOwner();
      }).then(function(data) {

        console.log(data); 
        
          carsLoaded = data; 
          var autoRow = $('#autoRow');
          var autoTemplate = $('#autoTemplate');

          var modalTemplate = $('#modal'); 
          var autoModal = $('.container'); 
  
          for (i = 0; i < data.length; i ++) {
            
            console.log(data[i]); 
            autoTemplate.find('.panel-title').text(data[i].name);
            autoTemplate.find('img').attr('src', data[i].picture);
            autoTemplate.find('.auto-age').text(data[i].age_production);
            autoTemplate.find('.auto-model').text(data[i].model);
            autoTemplate.find('.auto-price').text(data[i].price);
            autoTemplate.find('.auto-mot').text(data[i].motor);
            autoTemplate.find('.btn-buy').attr('data-id', data[i].tokenId);
            if(data[i].isSold == true) 
              autoTemplate.find('.btn-buy').attr('disabled', 'disabled');
            else
              autoTemplate.find('.btn-buy').removeAttr("disabled");
            autoTemplate.find('.btn-primary').attr('data-target',"#"+data[i].tokenId); 
      
            autoRow.append(autoTemplate.html());
            
            modalTemplate.find('.modal')[0].id=data[i].tokenId;            
            modalTemplate.find('.model-modal').text(data[i].model); 
            console.log(modalTemplate.find('.model-modal'));
            modalTemplate.find('.staging-modal').text(data[i].model); 
            modalTemplate.find('.optional-modal').text(data[i].optionals); 
            modalTemplate.find('.motor-modal').text(data[i].motor); 
            modalTemplate.find('.price-modal').text(data[i].price);
            modalTemplate.find('div.modal').attr("id",data[i].id);  
            autoModal.append(modalTemplate.html());

          
          
          }
        /*
        /*
        
        for (i = 0; i < adopters.length; i++) {
          if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
            $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
          }
        }*/
      }).catch(function(err) {
        console.log(err.message);
      
      });
      
  
    },
  
    handleAdopt: function(event) {
      event.preventDefault();
      
      var carId = parseInt($(event.target).data('id'));
  
      var cryptoInstance;
      alert("hai premuto "+carId+" price "+carsLoaded[carId].price); 
      
      web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
  
      var account = accounts[0];
      
  
      NewApp.contracts.CryptoCar.deployed().then(function(instance) {
        cryptoInstance = instance;
  
        // Execute adopt as a transaction by sending account
        return cryptoInstance.buyCar(carId, {from: account, value: carsLoaded[carId].price });
      }).then(function(result) {
        let tokenBuyed = result.receipt.logs[0].args[1]
        alert("Complimenti hai acquistato -> "+tokenBuyed); 
        $(event.target).attr('disabled', 'disabled');
        return console.log(tokenBuyed);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  
    }
  
  };
  
  $(function() {
    $(window).load(function() {
      NewApp.init();
    });
  });