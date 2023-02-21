 
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
      

      $.getJSON('abi/CarLedger.json', function(data) {
        // Get the necessary contract artifact file and instantiate it with @truffle/contract
        var LedgerArtifacts = data;
        NewApp.contracts.Ledger = TruffleContract(LedgerArtifacts);
      
        // Set the provider for our contract
        NewApp.contracts.Ledger.setProvider(NewApp.web3Provider);
      
        // Use our contract to retrieve and mark the adopted pets
        return NewApp.loadCar();
      });
    },
    
    loadCar: function() {
      
      var ledgerInstance;
  
      NewApp.contracts.Ledger.deployed().then(function(instance) {
        ledgerInstance = instance;
        
        web3.eth.getAccounts(function(error, accounts) {
          if (error) {
            console.log(error);
          }
      
          var account = accounts[0];
      
          NewApp.contracts.Ledger.deployed().then(function(instance) {
            ledgerInstance = instance;
      
            // Execute adopt as a transaction by sending account
            return ledgerInstance.getCarsbyOwner({from:account});
          
          }).then(function(result) {
            
            console.log(result); 
        
            carsLoaded = result; 
            var autoRow = $('#autoRow');
            var autoTemplate = $('#autoTemplate');
            var modalTemplate = $('#modal'); 
            var autoModal = $('.container'); 
    
            for (i = 0; i < carsLoaded.length; i ++) {
              
            
              autoTemplate.find('.panel-title').text(carsLoaded[i].name);
              autoTemplate.find('img').attr('src', carsLoaded[i].picture);
              autoTemplate.find('.auto-age').text(carsLoaded[i].age_production);
              autoTemplate.find('.auto-model').text(carsLoaded[i].model);
              autoTemplate.find('.NFT-ID').text(carsLoaded[i].nftID);
              autoTemplate.find('.auto-mot').text(carsLoaded[i].motor+" "+carsLoaded[i].power+" kw");
              autoTemplate.find('.btn-primary').attr('data-target',"#"+carsLoaded[i].nftID);
              autoTemplate.find('.btn-transfer').attr('nft-id', carsLoaded[i].nftID); 
        
              autoRow.append(autoTemplate.html());
              modalTemplate.find("img").attr("src",carsLoaded[i].picture); 
              modalTemplate.find('.modal')[0].id=carsLoaded[i].nftID;            
              modalTemplate.find('.model-modal').text(carsLoaded[i].model); 
              modalTemplate.find('.staging-modal').text(carsLoaded[i].staging); 
              modalTemplate.find('.optional-modal').text(carsLoaded[i].optionals); 
              modalTemplate.find('.motor-modal').text(carsLoaded[i].motor); 
              //modalTemplate.find('div.modal').attr("id",carsLoaded[i].nftID);
              modalTemplate.find("a").attr("href",carsLoaded[i].url_info);
                            
              autoModal.append(modalTemplate.html());
  
              let serviceBody = $("#"+carsLoaded[i].nftID).find('.body-service');
              
              for(j = 0; j < carsLoaded[i].services.length ; j++){
                
                let date =  new Date(carsLoaded[i].services[j].date *1000); 
                let stringDate = date.getDate() +"/"+(date.getMonth()+1)+"/"+date.getFullYear();
                
                let info = carsLoaded[i].services[j].office +" "+carsLoaded[i].services[j].operation; 
                let km = carsLoaded[i].services[j].km;
                serviceBody.append("<tr>"+
                                  "<td>"+stringDate+"</td>"+
                                  "<td>"+km+"</td>"+
                                  "<td>"+info+"</td>"+
                                  "</tr>"); 

              }
              
              let historyBody = $("#"+carsLoaded[i].nftID).find('.body-history');
              
              for(j = 0; j < carsLoaded[i].history.length ; j++){
                let date = new Date(carsLoaded[i].history[j].date*1000); 
                let stringDate = date.getDate() +"/"+(date.getMonth()+1)+"/"+date.getFullYear();
                historyBody.append("<tr><td>"+stringDate+"</td><td>"+carsLoaded[i].history[j].adr+"</td></tr>")
       
              }


            
            }  

          }).catch(function(err) {
            console.log(err.message);
          });
        });
        
        
        
      });
    },

    loadModal:function(event){
      
      event.preventDefault();
      let nftId = $(event.target).attr('nft-id');  
      $("#nftId").attr("value",nftId); 
      $('#responseTransfer').text("");
      $("#transferPropModal").modal('show'); 

    },

    transfer : function(){

      let tokenId = $("#nftId").val(); 
      let address = $("#addressModal").val();

      var ledgerInstance;
 
      
      web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
  
      var account = accounts[0];
      
  
      NewApp.contracts.Ledger.deployed().then(function(instance) {
        ledgerInstance = instance;
  
        // Execute adopt as a transaction by sending account
        return ledgerInstance.safeTransferFrom(account,address,tokenId, {from: account});
      }).then(function(result) {
        console.log(result);
        
        $("#message").find(".modal-body").html("<p>strong>Trasferimento Completato</strong></p>");
        $('#responseTransfer').toggleClass('bg-success');
        $('#responseTransfer').removeClass('bg-danger');
        $('#responseTransfer').text("Trasferimento Completato");

        setTimeout(function() {
          location.reload();
        }, 4000);
        
      }).catch(function(err) {
        console.log(err.message);
        $('#responseTransfer').toggleClass('bg-danger');
        $('#responseTransfer').removeClass('bg-success');
        $('#responseTransfer').text("Errore nel trasferimento");
      });
    });

      

    },
  
    check : function(){

      let ledgerInstance;
      let nftId = $("#nftCheck").val();
      $("#responseCheck").text(""); 
      NewApp.contracts.Ledger.deployed().then(function(instance) {
        ledgerInstance = instance;
        
        web3.eth.getAccounts(function(error, accounts) {
          if (error) {
            console.log(error);
          }
      
          var account = accounts[0];
      
          NewApp.contracts.Ledger.deployed().then(function(instance) {
            ledgerInstance = instance;
      
            // Execute adopt as a transaction by sending account
            return ledgerInstance.getInfoCar(nftId);
          
          }).then(function(result) {
            
            console.log(result); 
        
            car = result; 
            var carCheck = $('#checkResponse');
    
            carCheck.find("img").attr("src",car.picture);           
            carCheck.find('.model-modal').text(car.model); 
            carCheck.find('.staging-modal').text(car.staging); 
            carCheck.find('.optional-modal').text(car.optionals); 
            carCheck.find('.motor-modal').text(car.motor); 
            carCheck.find("a").attr("href",car.url_info);
          
            let serviceBody = carCheck.find('.body-service');
            serviceBody.empty();

            for(j = 0; j < car.services.length ; j++){
              
              let date =  new Date(car.services[j].date *1000); 
              let stringDate = date.getDate() +"/"+(date.getMonth()+1)+"/"+date.getFullYear();
              
              let info = car.services[j].office +" "+car.services[j].operation; 
              let km = car.services[j].km;
              serviceBody.append("<tr>"+
                                "<td>"+stringDate+"</td>"+
                                "<td>"+km+"</td>"+
                                "<td>"+info+"</td>"+
                                "</tr>"); 

            }
            
            let historyBody = carCheck.find('.body-history');
            historyBody.empty();
            for(j = 0; j < car.history.length ; j++){
              let date = new Date(car.history[j].date*1000); 
              let stringDate = date.getDate() +"/"+(date.getMonth()+1)+"/"+date.getFullYear();
              historyBody.append("<tr><td>"+stringDate+"</td><td>"+car.history[j].adr+"</td></tr>")
      
            }

            $("#checkResponse").modal('show'); 

          }).catch(function(err) {
            console.log(err.message);
            $("#responseCheck").text("Errore l'auto non esiste"); 
          });
        });
        
        
        
      });

    }
  };
  
  $(function() {
    $(window).load(function() {
      NewApp.init();
    });
  });