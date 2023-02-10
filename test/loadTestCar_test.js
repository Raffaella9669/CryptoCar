const CryptoCar = artifacts.require("CryptoCar");

const fs = require('fs');

let rawdata = fs.readFileSync('pets2.json');
let carsData = JSON.parse(rawdata);
var instanceVendor; 
var expectedList; 

contract("CryptoCar", (accounts) => {
  
    it("Try to load car on contract", async () =>{
        
        const cryptoInstance = await CryptoCar.deployed();

        await carsData.forEach(async element => {
            
            console.log(element.picture + "  "+ a);
            //let a = await cryptoInstance.addCar(element.modello, element.name, element.picture, element.age_production, element.allestimento, element.motorizzazione, element.kw, element.optional, element.url, parseInt(element.prezzo) ,{from: accounts[0]}); 
             
        });
        
        let b = cryptoInstance.getCarList({from: accounts[0]}); 
        console.log(b); 
        }); 
    

});
