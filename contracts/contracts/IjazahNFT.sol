// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title IjazahNFT
 * @dev NFT-based Digital Diploma Registry with issuance, revocation, and verification
 * @notice Implements PRD specification for blockchain-based diploma system
 */
contract IjazahNFT is ERC721, ERC721URIStorage, AccessControl {
    /// @notice Role identifier for authorized diploma issuers
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    /// @notice Auto-incrementing token ID counter
    uint256 private _nextTokenId;

    /// @notice Diploma data structure matching PRD specification
    struct Diploma {
        bytes32 documentHash; // SHA-256 hash of the diploma document
        string cid; // IPFS CID or storage URL
        address issuer; // Address that issued the diploma
        bytes signature; // ECDSA signature from issuer
        uint256 timestamp; // Block timestamp when issued
        bool isActive; // Active status (false = revoked)
    }

    /// @notice Mapping from token ID to Diploma data
    mapping(uint256 => Diploma) public diplomas;

    /// @notice Student metadata structure for frontend display
    struct DiplomaMetadata {
        string studentName;
        string nim;
    }

    /// @notice Mapping from token ID to student metadata
    mapping(uint256 => DiplomaMetadata) public diplomaMetadata;

    /// @notice Mapping from token ID to revocation reason
    mapping(uint256 => string) public revocationReasons;

    /// @notice Emitted when a new diploma is issued
    event DiplomaIssued(
        uint256 indexed diplomaId,
        address indexed recipient,
        address indexed issuer,
        bytes32 documentHash,
        string cid,
        string studentName,
        string nim,
        uint256 timestamp
    );

    /// @notice Emitted when a diploma is revoked
    event DiplomaRevoked(
        uint256 indexed diplomaId,
        address indexed revoker,
        string reason,
        uint256 timestamp
    );

    /**
     * @dev Constructor sets up the contract with initial admin and issuer roles
     * @param initialAdmin Address that will have DEFAULT_ADMIN_ROLE and ISSUER_ROLE
     */
    constructor(address initialAdmin) ERC721("Ijazah Digital", "IJAZAH") {
        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _grantRole(ISSUER_ROLE, initialAdmin);
    }

    /**
     * @notice Issue a new diploma as an NFT
     * @dev Only accounts with ISSUER_ROLE can call this function
     * @param _recipient Address to receive the diploma NFT
     * @param _documentHash SHA-256 hash of the diploma document
     * @param _cid IPFS CID or storage URL for encrypted diploma
     * @param _signature ECDSA signature from the issuer
     * @param _studentName Name of the student
     * @param _nim Student ID number (NIM)
     * @return diplomaId The ID of the newly issued diploma
     */
    function issueDiploma(
        address _recipient,
        bytes32 _documentHash,
        string memory _cid,
        bytes memory _signature,
        string memory _studentName,
        string memory _nim
    ) external onlyRole(ISSUER_ROLE) returns (uint256) {
        uint256 diplomaId = _nextTokenId++;

        // Mint the NFT to recipient
        _safeMint(_recipient, diplomaId);
        _setTokenURI(diplomaId, _cid);

        // Store diploma data
        diplomas[diplomaId] = Diploma({
            documentHash: _documentHash,
            cid: _cid,
            issuer: msg.sender,
            signature: _signature,
            timestamp: block.timestamp,
            isActive: true
        });

        // Store student metadata
        diplomaMetadata[diplomaId] = DiplomaMetadata({
            studentName: _studentName,
            nim: _nim
        });

        emit DiplomaIssued(
            diplomaId,
            _recipient,
            msg.sender,
            _documentHash,
            _cid,
            _studentName,
            _nim,
            block.timestamp
        );

        return diplomaId;
    }

    /**
     * @notice Revoke a previously issued diploma
     * @dev Only accounts with ISSUER_ROLE can revoke diplomas
     * @param _diplomaId ID of the diploma to revoke
     * @param _reason Reason for revocation (max 500 characters recommended)
     */
    function revokeDiploma(
        uint256 _diplomaId,
        string memory _reason
    ) external onlyRole(ISSUER_ROLE) {
        require(_ownerOf(_diplomaId) != address(0), "Diploma does not exist");
        require(diplomas[_diplomaId].isActive, "Diploma already revoked");

        diplomas[_diplomaId].isActive = false;
        revocationReasons[_diplomaId] = _reason;

        emit DiplomaRevoked(_diplomaId, msg.sender, _reason, block.timestamp);
    }

    /**
     * @notice Verify a diploma's validity and status
     * @dev Returns whether the diploma exists and is not revoked
     * @param _diplomaId ID of the diploma to verify
     * @return isValid True if the diploma exists
     * @return isActive True if the diploma has not been revoked
     */
    function verifyDiploma(
        uint256 _diplomaId
    ) external view returns (bool isValid, bool isActive) {
        // Check if diploma exists (owner is not zero address)
        isValid = _ownerOf(_diplomaId) != address(0);

        if (isValid) {
            isActive = diplomas[_diplomaId].isActive;
        } else {
            isActive = false;
        }

        return (isValid, isActive);
    }

    /**
     * @notice Get complete diploma details
     * @param _diplomaId ID of the diploma
     * @return owner Current owner of the diploma NFT
     * @return diploma Complete diploma data struct
     */
    function getDiplomaDetails(
        uint256 _diplomaId
    ) external view returns (address owner, Diploma memory diploma) {
        require(_ownerOf(_diplomaId) != address(0), "Diploma does not exist");
        return (ownerOf(_diplomaId), diplomas[_diplomaId]);
    }

    /**
     * @notice Get diploma metadata (student info)
     * @param _diplomaId ID of the diploma
     * @return studentName Name of the student
     * @return nim Student ID number
     */
    function getDiplomaMetadata(
        uint256 _diplomaId
    ) external view returns (string memory studentName, string memory nim) {
        require(_ownerOf(_diplomaId) != address(0), "Diploma does not exist");
        DiplomaMetadata memory metadata = diplomaMetadata[_diplomaId];
        return (metadata.studentName, metadata.nim);
    }

    /**
     * @notice Verify diploma hash matches stored hash
     * @param _diplomaId ID of the diploma
     * @param _documentHash Hash to compare against stored hash
     * @return True if hashes match
     */
    function verifyHash(
        uint256 _diplomaId,
        bytes32 _documentHash
    ) external view returns (bool) {
        require(_ownerOf(_diplomaId) != address(0), "Diploma does not exist");
        return diplomas[_diplomaId].documentHash == _documentHash;
    }

    /**
     * @notice Get the total number of diplomas issued
     * @return Total count of diplomas (includes revoked)
     */
    function getTotalDiplomas() external view returns (uint256) {
        return _nextTokenId;
    }

    /**
     * @notice Add a new issuer
     * @dev Only DEFAULT_ADMIN_ROLE can add issuers
     * @param _issuer Address to grant ISSUER_ROLE
     */
    function addIssuer(address _issuer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(ISSUER_ROLE, _issuer);
    }

    /**
     * @notice Remove an issuer
     * @dev Only DEFAULT_ADMIN_ROLE can remove issuers
     * @param _issuer Address to revoke ISSUER_ROLE from
     */
    function removeIssuer(
        address _issuer
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(ISSUER_ROLE, _issuer);
    }

    /**
     * @notice Check if an address is an authorized issuer
     * @param _address Address to check
     * @return True if address has ISSUER_ROLE
     */
    function isIssuer(address _address) external view returns (bool) {
        return hasRole(ISSUER_ROLE, _address);
    }

    // ============ Required Overrides ============

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
