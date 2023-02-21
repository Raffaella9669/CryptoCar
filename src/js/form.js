
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
      
      $.getJSON('abi/CryptoCar.json', function(data) {
        // Get the necessary contract artifact file and instantiate it with @truffle/contract
        var CryptoCarArtifacts = data;
        var accountsLogged; 
        App.contracts.CryptoCar = TruffleContract(CryptoCarArtifacts);
      
        // Set the provider for our contract
        App.contracts.CryptoCar.setProvider(App.web3Provider);

        App.contracts.CryptoCar.deployed().then(function(instance) {
          cryptoCarInstance = instance;
          
          cryptoCarInstance.MEC_ROLE().then( function(mec_role){

          web3.eth.getAccounts()
            .then(function(accounts){ 
              accountsLogged = accounts;
              cryptoCarInstance.hasRole(mec_role,accounts[0]).then(function(hasRole){
                if(hasRole != true)
                  {
                    alert("Non hai i permessi per accedere ... non hai il ruolo meccanico"); 
                    window.location.href="index.html"; 
                  }
                 
              }).then(function(){
                cryptoCarInstance.DEFAULT_ADMIN_ROLE().then(function(admin_role){
                  cryptoCarInstance.hasRole(admin_role,accountsLogged[0]).then(function(hasAdminRole){
                    if(hasAdminRole != true)
                      $(".admin-mode").remove();

                    return App.bindEvents();
                    
                  })
                })
              })})
            .catch(error => console.error(error));
          
        })
          
          });
 
       
      });
  
    },
  
    bindEvents: function() {
      $(document).on('click', '.btn-service', App.addService);
      $(document).on('click', '.btn-withdraw', App.withdraw);
    },
  
  
    addService: function(event) {
      event.preventDefault();
      
      let addr = $("#inputAddress").val();
      let id = $("#IdNFT").val();
      let km = $("#kmAuto").val();
      let man = $("#manutenzioneEffettuata").val(); 
      
      App.contracts.CryptoCar.deployed().then(function(instance) {
        cryptoCarInstance = instance;
        web3.eth.getAccounts()
          .then(accounts => {
            cryptoCarInstance.insertServiceCustomer(id, km, man, {from:accounts[0]} ).then(function(result){
              console.log(result); 
              $('#responseCheck').toggleClass('bg-success');
              $('#responseCheck').removeClass('bg-danger');
              $("#responseCheck").text("Inserimento effettuato con successo");
            })
          })
          .catch(error => {
            console.error(error); 
            $('#responseCheck').toggleClass('bg-danger');
            $('#responseCheck').removeClass('bg-success');
            $("#responseCheck").text("Errore durante l'inserimento");
          });
       

      })
  
 
  
    },

    withdraw: function(event) {
      event.preventDefault();
        
      App.contracts.CryptoCar.deployed().then(function(instance) {
        cryptoCarInstance = instance;
        web3.eth.getAccounts()
          .then(accounts => {
            cryptoCarInstance.withdrow({from:accounts[0]} ).then(function(result){
              console.log(result); 
            })
          })
          .catch(error => console.error(error));
       

      })
  
 
  
    }
  
  };
  
  $(function() {
    $(window).load(function() {
      App.init();
    });
  });