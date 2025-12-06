// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IjazahNFT
 * @dev NFT contract for Ijazah (Certificate) tokens
 */
contract IjazahNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // Mapping from token ID to certificate data hash
    mapping(uint256 => bytes32) public certificateHashes;
    
    // Mapping from token ID to issuer address
    mapping(uint256 => address) public issuers;
    
    // Mapping from token ID to issue timestamp
    mapping(uint256 => uint256) public issueDates;
    
    // Event emitted when a new certificate is minted
    event CertificateMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        address indexed issuer,
        bytes32 certificateHash,
        string tokenURI
    );

    constructor(address initialOwner) 
        ERC721("Ijazah Certificate", "IJAZAH")
        Ownable(initialOwner)
    {}

    /**
     * @dev Mint a new certificate NFT
     * @param recipient Address to receive the certificate
     * @param certificateHash Hash of the certificate data (for verification)
     * @param uri Metadata URI for the certificate
     * @return newTokenId The ID of the newly minted token
     */
    function mintCertificate(
        address recipient,
        bytes32 certificateHash,
        string memory uri
    ) public onlyOwner returns (uint256) {
        uint256 newTokenId = _nextTokenId++;

        _safeMint(recipient, newTokenId);
        _setTokenURI(newTokenId, uri);
        
        certificateHashes[newTokenId] = certificateHash;
        issuers[newTokenId] = msg.sender;
        issueDates[newTokenId] = block.timestamp;

        emit CertificateMinted(
            newTokenId,
            recipient,
            msg.sender,
            certificateHash,
            uri
        );

        return newTokenId;
    }

    /**
     * @dev Verify a certificate by comparing its hash
     * @param tokenId The token ID to verify
     * @param certificateHash The hash to compare against
     * @return bool True if the hashes match
     */
    function verifyCertificate(
        uint256 tokenId,
        bytes32 certificateHash
    ) public view returns (bool) {
        require(_ownerOf(tokenId) != address(0), "Certificate does not exist");
        return certificateHashes[tokenId] == certificateHash;
    }

    /**
     * @dev Get certificate details
     * @param tokenId The token ID
     * @return owner Owner address
     * @return issuer Issuer address
     * @return issueDate Timestamp when issued
     * @return certificateHash Hash of certificate data
     */
    function getCertificateDetails(uint256 tokenId)
        public
        view
        returns (
            address owner,
            address issuer,
            uint256 issueDate,
            bytes32 certificateHash
        )
    {
        require(_ownerOf(tokenId) != address(0), "Certificate does not exist");
        
        return (
            ownerOf(tokenId),
            issuers[tokenId],
            issueDates[tokenId],
            certificateHashes[tokenId]
        );
    }

    /**
     * @dev Override required by Solidity
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Override required by Solidity
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
