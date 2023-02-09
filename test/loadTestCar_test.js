const CryptoCar = artifacts.require("Adoption");

const fs = require('fs');

let rawdata = fs.readFileSync('pets.json');
let carsData = JSON.parse(rawdata);

contract("CryptoCar", (accounts) => {
  
  before(async () => {
      adoption = await CryptoCar.deployed();
  });

  describe("Loading some car into a list of CryptoCar", async () => {
    before("adopt a pet using accounts[0]", async () => {
      
        await adoption.adopt(8, { from: accounts[0] });
      expectedAdopter = accounts[0];
    });
  
});
});

let insanceVendor = await Vendor.deployed().then(async function(){

    console.log(carsData.lenght); 
    carsData.forEach(async element => {
        
        //let res = await instanceVendor.addCar(element.modello, element.name, element.picture, element.age_production, element.allestimento, element.motorizzazione, element.kw, element.optionals, element.url, element.price
            //,{from:account});
        //console.log("res----> "+res);. 
        console.log("Inserted :"+element); 

    });
    


}); 
