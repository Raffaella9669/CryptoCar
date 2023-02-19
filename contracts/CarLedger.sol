// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CarLedger is ERC721, ERC721Enumerable, AccessControl {
    using Counters for Counters.Counter; 

    event LogLedger(string info, address sito, uint256[] tokens); 
    event LogCars(uint256[] owners, address from );
    event LogInfo(Info[] info);

    Counters.Counter private _tokenIdCounter;
    
    bytes32 public constant DEALER_ROLE = keccak256("DEALER_ROLE");
    bytes32 public constant SERVICE_ROLE = keccak256("SERVICE_ROLE");
    
    struct Service {
        uint date;
        uint32 km;
        string operation; 
        string office; 

    }

    struct Info {
        string name; 
        string age_production; 
		string model;
		string staging; 
		string motor;
		string power;  
        Service[] services; 
        address[] history;
        string vin; 
        string plate;
        string optionals; 
        string url_info;
        string picture;  
        bool isSet; 
    }

    mapping( uint256 => Info ) private ledger; 
    mapping(address => uint256[] ) private ownersList; 


    constructor() ERC721("CarLedger", "CLed") {

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        grantRole(DEALER_ROLE, msg.sender);
        grantRole(SERVICE_ROLE, msg.sender); 
     
    }

    function addDealer(address dealer) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(DEALER_ROLE, dealer);
    }

    
    function addStation(address serv) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(SERVICE_ROLE, serv);
    }

    function revokeDealer(address dealer) public onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(DEALER_ROLE, dealer);
    }

    
    function revokeStation(address serv) public onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(SERVICE_ROLE, serv);
    }

    function createCar(address to ,string memory _name,string memory _age_production, string memory _model,string memory _staging, string memory _motor, string memory _power, string memory _url_info, string memory _optionals, string memory picture  ) public onlyRole(DEALER_ROLE) returns (uint256) {

        uint256 tokenId = _tokenIdCounter.current(); 
        
        _safeMint(to, tokenId);
        ledger[tokenId].power = _power;
        ledger[tokenId].motor = _motor;
        ledger[tokenId].staging = _staging;  
        ledger[tokenId].age_production = _age_production; 
        ledger[tokenId].name = _name; 
        ledger[tokenId].vin = Strings.toString(block.timestamp%19);
        ledger[tokenId].plate = Strings.toString((block.timestamp+200)%8); 
        ledger[tokenId].model = _model; 
        ledger[tokenId].isSet = true;
        ledger[tokenId].url_info = _url_info;
        ledger[tokenId].optionals = _optionals;
        ledger[tokenId].services.push(Service(block.timestamp , 0 , "", "Car created" ));
        ledger[tokenId].picture = picture;
        _tokenIdCounter.increment();
        return tokenId; 
    }

    function addService( uint256 tokenId, uint32 _km, string memory _operation, string memory _office) public onlyRole(SERVICE_ROLE)  {

        require(ledger[tokenId].isSet == true , "Veichle doesen't exists");
        ledger[tokenId].services.push(Service(block.timestamp, _km, _operation, _office ));
        

    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        removeTokenIdList(tokenId, from);
        ownersList[to].push(tokenId); 
        ledger[tokenId].history.push(to);
         
    }


    function getInfoCar(uint256 tokenId) public view returns ( Info memory ){

        require( ledger[tokenId].isSet == true , "The car doesen't exists");
        return ledger[tokenId]; 

    }
    
    function getCarsbyOwner() public view returns (Info[] memory){
        
        uint256[] memory owners = ownersList[msg.sender];
        
        Info[] memory cars = new Info[](owners.length);
    
        for (uint i = 0; i < owners.length; i++) {
            cars[i] = getInfoCar(owners[i]); 
        }
  
        return cars; 
    }

    function removeTokenIdList(uint256 tokenId , address from) internal {
        
        for (uint i = 0; i < ownersList[from].length; i++) {
            if (ownersList[from][i] == tokenId) {
                ownersList[from][i] = ownersList[from][ownersList[from].length-1];
                ownersList[from].pop(); 
            }
        }
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable,AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
