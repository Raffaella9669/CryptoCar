var Ledger = artifacts.require("CarLedger");
var Vendor = artifacts.require("CryptoCar");

const fs = require('fs');
let rawdata = fs.readFileSync('cars.json');
var carsData = JSON.parse(rawdata);

module.exports = async function(deployer, network , accounts) {

	//deployer.deploy(Car);
	let account = accounts[0]
	console.info("Using this as admin of both :"+ account); 
	deployer.deploy( Ledger,{from: account}).then(function() {
		
		console.log("Contract Ledger Deployed : " +  Ledger.address); 
		return deployer.deploy(Vendor, Ledger.address,{ from: account});
	  
	}).then(async function(){
		
		console.info("admin account : "+account); 
		let instanceLedger =await Ledger.deployed(); 
		
		instanceLedger.addDealer(Vendor.address, {from: account}); 
		instanceLedger.addStation(Vendor.address, {from: account});

		let mechanic = accounts[1];
		let instanceVendor =await Vendor.deployed();   
		instanceVendor.addMech(mechanic, {from: account}); 

		console.log("mech joined : "+mechanic);

	}).then(async function(){
		
		console.log("insert cars..."); 

		
		let instanceVendor =await Vendor.deployed();   

		await carsData.forEach( element => {
            
            let a = instanceVendor.addCar(element.modello, element.name, element.picture, element.age_production, element.allestimento, element.motorizzazione, element.kw, element.optional, element.url, parseInt(element.prezzo) ,{from: accounts[0]});    
        });
		

	});


	
};
