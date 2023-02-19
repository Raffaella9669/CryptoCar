// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";


interface ICarLedger {

	function createCar(address to ,string memory _name,string memory _age_production, string memory _model,string memory _staging, string memory _motor, string memory _power, string memory _url_info, string memory _optionals , string memory picture  )  external returns (uint256); 

	function addDealer(address dealer) external;

	function addService( uint256 tokenId, uint32 _km, string memory _operation, string memory _office) external;

	function addStation(address serv) external;  

}

contract CryptoCar is AccessControl, ReentrancyGuard {
	 using Counters for Counters.Counter; 
	 using SafeMath for uint256;

    Counters.Counter private _tokenIdCounter;

	event Log(string message);
	event CarCreation( string message, string tokenId, address to); 
	event CarAdd( string message, string id, string model); 

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

	function insertServiceCustomer(uint256 tokenId, uint32 _km, string memory _operation) public onlyRole(MEC_ROLE) returns (bool)  {

		try	carLedger.addService(tokenId, _km, _operation, "CryptoCar")
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
				cars[j].tokenId = i; 
				j++; 
			}
    }

    	return cars; 
	}

	function addCar(string memory model, string memory name, string memory picture, string memory age_prod, string memory staging, string memory motor, string memory power, string memory optionals, string memory url_info, uint256 price) external onlyRole(DEALER_ROLE) returns (uint256) {

		uint256 Id = _tokenIdCounter.current(); 
		list[Id].name = name; 
		list[Id].picture = picture;
		list[Id].age_production = age_prod; 
		list[Id].model = model;
		list[Id].staging = staging;
		list[Id].motor = motor;
		list[Id].power = power;
		list[Id].optionals = optionals;
		list[Id].url_info = url_info;
		list[Id].isSold = false;
		list[Id].isSet = true;
		list[Id].price = price; 
		emit CarAdd("New car joined to the list", Strings.toString(Id) , list[Id].model);
		_tokenIdCounter.increment();
		return Id; 
	}    
 

	function buyCar( uint256 idCar ) public payable returns (uint256)  {

		require(list[idCar].isSet == true , "The car doesn't exists");
		require(list[idCar].isSold == false ,"Already sold");
		require(convertWeiToEthSafe( msg.value )  == list[idCar].price , "Insufficient or not correct funds" ); 
		try carLedger.createCar(msg.sender,list[idCar].name,list[idCar].age_production, list[idCar].model, list[idCar].staging, list[idCar].motor,list[idCar].power, list[idCar].url_info, list[idCar].optionals, list[idCar].picture ) returns(uint256 carId)
		{
			list[idCar].isSold = true;
			list[idCar].tokenId = carId;
			emit CarCreation("Car created", Strings.toString(carId) , msg.sender);
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

	function convertWeiToEthSafe(uint256 weiAmount) internal pure returns (uint256) {
        uint256 ethAmount = weiAmount.div(10**18); // divisione per 10^18
        return ethAmount;
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
