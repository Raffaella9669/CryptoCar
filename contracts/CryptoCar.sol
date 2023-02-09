// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


interface ICarLedger {

	function createCar(address to , string memory _model, string memory _url_info, string memory _optionals  ) external returns (uint256); 

	function addDealer(address dealer) external;

	function addService(address client, uint256 tokenId, uint32 _km, string memory _operation, string memory _office) external;

	function addStation(address serv) external;  

}

contract CryptoCar is AccessControl, ReentrancyGuard {
	 using Counters for Counters.Counter; 

    Counters.Counter private _tokenIdCounter;

	event Log(string message);
	event CarCreation( string message, uint256 tokenId, address to); 
	event CarAdd( string message, uint256 id, Info info); 

	bytes32 public constant DEALER_ROLE = keccak256("DEALER_ROLE");
    bytes32 public constant MEC_ROLE = keccak256("MEC_ROLE");

	address payable private _owner;  
	ICarLedger private carLedger; 

	struct Info { 

		string name;
		string picture; 
        string age_production; 
		string model;
		string staging; 
		string motor;
		string power;  
        string optionals; 
        string url_info; 
        bool isSold;
		bool isSet;
		uint256 price; //wei
		uint256 tokenId;    
    }

	mapping(uint256 => Info) private list;

	constructor( address ledger ){

		_owner =payable (msg.sender);
		_setupRole(DEFAULT_ADMIN_ROLE, _owner);
		grantRole(DEALER_ROLE, _owner);
		grantRole(MEC_ROLE, _owner);
		carLedger = ICarLedger(ledger);

	}

	function addMech(address mec) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MEC_ROLE, mec);
    }

	function insertServiceCustomer(address client, uint256 tokenId, uint32 _km, string memory _operation) public onlyRole(MEC_ROLE) returns (bool)  {

		try	carLedger.addService(client, tokenId, _km, _operation, "CryptoCar")
		{
			return true; 
		
		}catch 
		{
			return false;
		} 
	}

	function getCarList() public view returns( Info[] memory){
		
		uint j  = 0; 
		Info[] memory cars = new Info[](_tokenIdCounter.current());
    	for (uint i = 0; i < _tokenIdCounter.current(); i++) {
        	
			if(list[i].isSet == true)
			{	
				cars[j] = list[i];
				j++; 
			}
    }

    	return cars; 
	}

	function addCar(string memory model, string memory name, string memory picture, string memory age_prod, string memory staging, string memory motor, string memory power, string memory optionals, string memory url_info, uint256 price) external onlyRole(DEALER_ROLE) returns (uint256) {

		uint256 Id = _tokenIdCounter.current(); 
		Info memory _newInfo = Info(name,picture,age_prod ,model, staging, motor, power, optionals, url_info, false, true, price, Id);
		list[Id] = _newInfo; 
		emit CarAdd("New car joined to the list", Id, list[Id]);
		return Id; 
	}    
 

	function buyCar( uint256 idCar ) public payable returns (uint)  {

		require(list[idCar].isSet == true , "The car doesn't exists");
		require(list[idCar].isSold == false ,"Already sold");
		require(msg.value >= list[idCar].price , "Insufficient funds" ); 
		
		try carLedger.createCar(msg.sender, list[idCar].model, list[idCar].url_info, list[idCar].optionals) returns(uint256 carId)
		{
			list[idCar].isSold = true;
			list[idCar].tokenId = carId;
			emit CarCreation("Car created", carId, msg.sender);
			return carId;

		}catch
		{
			emit Log("An error occured during car creation");
			revert();
		}
	}

	function withdrow() external payable onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant()  {

		uint256 balance = address(this).balance;
		(bool sent,) = msg.sender.call{value: balance}("");
        require(sent, "Failed withdrow Ether");
		emit Log( string(abi.encodePacked("Withdrow happen : ", balance)) );

	}

	receive() external payable{

		emit Log("Reverting ...try to buy a car from one of our store");
		revert();

	}
	fallback() external payable{

		emit Log("Reverting ...try to buy a car from one of our store");
		revert();

	}

	



	

}
