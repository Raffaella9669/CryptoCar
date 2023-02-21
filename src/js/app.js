var carsLoaded; 

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
        alert("Installa una gestore di wallet"); 
        return
      }
      
      web3 = new Web3(App.web3Provider);
  
  
      return App.initContract();
    },
  
    initContract: function() {
      
      $.getJSON('abi/CryptoCar.json', function(data) {
        // Get the necessary contract artifact file and instantiate it with @truffle/contract
        var CryptoCarArtifacts = data;
        App.contracts.CryptoCar = TruffleContract(CryptoCarArtifacts);
      
        // Set the provider for our contract
        App.contracts.CryptoCar.setProvider(App.web3Provider);
      
        // Use our contract to retrieve and mark the adopted pets
        return App.loadCar();
      });
  
      return App.bindEvents();
    },
  
    bindEvents: function() {
      $(document).on('click', '.btn-buy', App.buy);
    },
  
    loadCar: function() {
      
      var cryptoCarInstance;
  
      App.contracts.CryptoCar.deployed().then(function(instance) {
        cryptoCarInstance = instance;
  
        return cryptoCarInstance.getCarList();
      }).then(function(data) {
        
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
            autoTemplate.find('.auto-price').text(data[i].price+" ETH");
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
            modalTemplate.find('.staging-modal').text(data[i].staging); 
            modalTemplate.find('.optional-modal').text(data[i].optionals); 
            modalTemplate.find('.motor-modal').text(data[i].motor); 
            modalTemplate.find('.price-modal').text(data[i].price);
            modalTemplate.find('div.modal').attr("id",data[i].id);
            modalTemplate.find('.link').attr("href",data[i].url_info);  
            modalTemplate.find('img').attr("src",data[i].picture);
            autoModal.append(modalTemplate.html());

          
          
          }
      });
      
  
    },
  
    buy: function(event) {
      event.preventDefault();
      
      var carId = parseInt($(event.target).data('id'));
  
      var cryptoInstance;
      alert("hai premuto "+carId+" price "+carsLoaded[carId].price); 
      
      web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
  
      var account = accounts[0];
  
      App.contracts.CryptoCar.deployed().then(function(instance) {
        cryptoInstance = instance;
  
        // Execute adopt as a transaction by sending account
        return cryptoInstance.buyCar(carId, {from: account, value: web3.utils.toWei(carsLoaded[carId].price, 'ether')});
      }).then(function(result) {
        let tokenBuyed = result.receipt.logs[0].args[1]
        let modal = $("#message"); 
        modal.find(".modal-body").html("Complimenti Per L'acquisto,Il token è:<br><h2>"+tokenBuyed+"</h2>"); 
        $(event.target).attr('disabled', 'disabled');
        modal.modal('show'); 
        return console.log(tokenBuyed);
      }).catch(function(err) {
        let modal = $("#message");
        console.log(err);  
        modal.find(".modal-body").text("Errore nell'acquisto potresti non avere sufficienti fondi"); 
        modal.modal('show');
      });
    });
  
    }
  
  };
  
  $(function() {
    $(window).load(function() {
      App.init();
    });
  });