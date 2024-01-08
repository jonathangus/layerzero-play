//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import './interfaces/ILayerZeroEndpoint.sol';
import './interfaces/ILayerZeroReceiver.sol';
import './NonblockingLzApp.sol';
import '@openzeppelin/contracts/utils/Base64.sol';
import '@openzeppelin/contracts/utils/Strings.sol';

error NotTokenOwner();
error URIQueryForNonexistentToken();
error InsufficientGas();

contract LFGCrossChainNFT is Ownable, NonblockingLzApp, ERC721 {
    uint256 public counter;
    uint256 public currentTokenId;
    uint256 public immutable MAX_ID;
    string private baseURI;

    event ReceivedNFT(
        uint16 _srcChainId,
        address _from,
        uint256 _tokenId,
        uint256 counter
    );

    constructor(
        address _endpoint,
        uint256 _startTokenId,
        string memory _baseUri
    ) NonblockingLzApp(_endpoint) ERC721('LFGCrossChainNFT', 'LFG') {
        baseURI = _baseUri;
        currentTokenId = _startTokenId;
        MAX_ID = currentTokenId + 99999;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();

        uint even = tokenId % 2;
        uint256 id = even == 0 ? 0 : 1;
        string memory json = Base64.encode(
            abi.encodePacked(
                '{"image": "',
                string(abi.encodePacked(baseURI, Strings.toString(id), '.png')),
                '"}'
            )
        );

        string memory output = string(
            abi.encodePacked('data:application/json;base64,', json)
        );

        return output;
    }

    function mint(uint256 quantity) external {
        for (uint256 i = 0; i < quantity; i++) {
            _mint(msg.sender, currentTokenId + i);
        }

        currentTokenId += quantity;
        counter += quantity;
    }

    function crossChain(uint16 dstChainId, uint256 tokenId) public payable {
        if (msg.sender != ownerOf(tokenId)) revert NotTokenOwner();

        // Remove NFT on current chain
        unchecked {
            --counter;
        }
        _burn(tokenId);

        bytes memory payload = abi.encode(msg.sender, tokenId);
        uint16 version = 1;
        uint256 gasForLzReceive = 350000;
        bytes memory adapterParams = abi.encodePacked(version, gasForLzReceive);

        (uint256 messageFee, ) = lzEndpoint.estimateFees(
            dstChainId,
            address(this),
            payload,
            false,
            adapterParams
        );
        if (msg.value <= messageFee) revert InsufficientGas();

        _lzSend(
            dstChainId,
            payload,
            payable(msg.sender),
            address(0x0),
            adapterParams,
            msg.value
        );
    }

    function _nonblockingLzReceive(
        uint16 _srcChainId,
        bytes memory _srcAddress,
        uint64 /*_nonce*/,
        bytes memory _payload
    ) internal override {
        address from;
        assembly {
            from := mload(add(_srcAddress, 20))
        }
        (address toAddress, uint256 tokenId) = abi.decode(
            _payload,
            (address, uint256)
        );

        _mint(toAddress, tokenId);
        unchecked {
            ++counter;
        }
        emit ReceivedNFT(_srcChainId, from, tokenId, counter);
    }

    // Endpoint.sol estimateFees() returns the fees for the message
    function estimateFees(
        uint16 dstChainId,
        uint256 tokenId
    ) external view returns (uint256) {
        bytes memory payload = abi.encode(msg.sender, tokenId);
        uint16 version = 1;
        uint256 gasForLzReceive = 350000;
        bytes memory adapterParams = abi.encodePacked(version, gasForLzReceive);

        (uint256 messageFee, ) = lzEndpoint.estimateFees(
            dstChainId,
            address(this),
            payload,
            false,
            adapterParams
        );
        return messageFee;
    }
}
