// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract CertificateVerifier is AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    struct Certificate {
        address issuer;
        address student;
        uint256 issuedAt;
        bool revoked;
        bool exists;
    }

    mapping(bytes32 => Certificate) public certificates;

    event Issued(
        bytes32 indexed certHash,
        address indexed student,
        address indexed issuer,
        uint256 timestamp
    );

    event Revoked(
        bytes32 indexed certHash,
        address indexed issuer,
        uint256 timestamp
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
    }

    function issueCertificate(bytes32 certHash, address student) external onlyRole(ISSUER_ROLE) {
        require(!certificates[certHash].exists, "Certificate already exists");

        certificates[certHash] = Certificate({
            issuer: msg.sender,
            student: student,
            issuedAt: block.timestamp,
            revoked: false,
            exists: true
        });

        emit Issued(certHash, student, msg.sender, block.timestamp);
    }

    function revokeCertificate(bytes32 certHash) external onlyRole(ISSUER_ROLE) {
        require(certificates[certHash].exists, "Certificate does not exist");
        require(!certificates[certHash].revoked, "Certificate already revoked");

        certificates[certHash].revoked = true;

        emit Revoked(certHash, msg.sender, block.timestamp);
    }

    function isValid(bytes32 certHash) external view returns (bool exists, bool revoked, address issuer, uint256 issuedAt) {
        Certificate memory cert = certificates[certHash];
        return (cert.exists, cert.revoked, cert.issuer, cert.issuedAt);
    }
}
