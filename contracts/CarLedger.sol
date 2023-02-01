// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CarLedger is ERC721, ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    struct Service {
        uint date;
        uint32 km;
        string operation; 

    }

    struct Info {
        Service[] services; 
        address[] history;

    }

    mapping( uint256 => Info ) ledger; 


    constructor() ERC721("CarLedger", "CLed") {

    }

    function safeMint(address to) public onlyOwner {

        uint256 tokenId = _tokenIdCounter.current(); 
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        ledger[tokenId].services.push(Service(block.timestamp , 0 , "" ));
        ledger[tokenId].history.push(to);
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        ledger[tokenId].history.push(to); 
    }


    function getHistory(uint256 tokenId) public view returns ( address[] memory ){

        return ledger[tokenId].history; 

    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
