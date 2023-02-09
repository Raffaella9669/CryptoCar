var Ledger = artifacts.require("CarLedger");
var Vendor = artifacts.require("CryptoCar");

module.exports = async function(deployer, network , accounts) {

	//deployer.deploy(Car);
	let account = accounts[0]
	console.log("Using this as admin of both"+ account); 
	deployer.deploy( Ledger,{from: account}).then(function() {
		
		console.log("Contract Ledger Deployed : " +  Ledger.address); 
		return deployer.deploy(Vendor, Ledger.address,{ from: account});
	  
	}).then(async function(){
		
		console.log("admin account : "+account); 
		let instanceLedger =await Ledger.deployed(); 
		
		instanceLedger.addDealer(Vendor.address, {from: account}); 
		instanceLedger.addStation(Vendor.address, {from: account});

		let mechanic = accounts[1];
		let instanceVendor =await Vendor.deployed();   
		instanceVendor.addMech(mechanic, {from: account}); 

		console.log("mech joined : "+mechanic);

	});


	
};


//var json = $.getJSON("pets.json");
