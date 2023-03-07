const CryptoCar = artifacts.require("CryptoCar");
const CarLedger = artifacts.require("CarLedger"); 


contract("CryptoCar", (accounts) => {
    let cryptoInstance,carLedgerInstance; 

    it("Try to get cars from contract", async () =>{
        
        cryptoInstance = await CryptoCar.deployed();
        
        let cars = await cryptoInstance.getCarList({from: accounts[0]}); 
        assert.equal(cars[0].name , "MG" , "Cars doesn't load correctly");
        });
    
    it("Try to sell car and get NFT", async() =>{

        cryptoInstance = await CryptoCar.deployed();
        carLedgerInstance = await CarLedger.deployed();

        let cars = await cryptoInstance.getCarList({from: accounts[0]});

        let nftId = BigInt((await cryptoInstance.buyCar(cars[0].tokenId, {from: accounts[1], value: web3.utils.toWei(cars[0].price, 'ether')})).receipt.logs[0].args[1]).toString();
        let ownerOf = await carLedgerInstance.ownerOf(nftId); 

        assert.equal(ownerOf , accounts[1] , "User doesn't buy correctly");
         
    });

    
    

});

contract("CarLedger", (accounts) => {
    let cryptoInstance,carLedgerInstance; 

    it("Try to check user garage after buying", async() =>{

        
        carLedgerInstance = await CarLedger.deployed();
        cryptoInstance = await CryptoCar.deployed();

        let cars = await cryptoInstance.getCarList({from: accounts[0]});

        await cryptoInstance.buyCar(cars[2].tokenId, {from: accounts[1], value: web3.utils.toWei(cars[2].price, 'ether')}); 

        let carsOwned = await carLedgerInstance.getCarsbyOwner({from:accounts[1]}); 
        assert.equal(carsOwned[0].name , cars[2].name , "User doesn't have nft correctly");
          
    });
    

});