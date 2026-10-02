import { expect } from "chai";
import hre from "hardhat";

describe("CertificateVerifier", function () {
  let CertificateVerifier;
  let contract;
  let admin, issuer, student, nonIssuer;
  let certHash;

  beforeEach(async function () {
    [admin, issuer, student, nonIssuer] = await hre.ethers.getSigners();
    CertificateVerifier = await hre.ethers.getContractFactory("CertificateVerifier");
    contract = await CertificateVerifier.deploy();
    await contract.waitForDeployment();

    const ISSUER_ROLE = await contract.ISSUER_ROLE();
    await contract.grantRole(ISSUER_ROLE, issuer.address);

    certHash = hre.ethers.id("test-certificate-data"); // SHA-256 equivalent in ethers for testing
  });

  describe("Issuance", function () {
    it("Should allow issuer to issue a certificate", async function () {
      await expect(contract.connect(issuer).issueCertificate(certHash, student.address))
        .to.emit(contract, "Issued")
        .withArgs(certHash, student.address, issuer.address, (val) => val > 0);

      const cert = await contract.certificates(certHash);
      expect(cert.exists).to.be.true;
      expect(cert.revoked).to.be.false;
      expect(cert.issuer).to.equal(issuer.address);
      expect(cert.student).to.equal(student.address);
    });

    it("Should not allow non-issuer to issue a certificate", async function () {
      await expect(
        contract.connect(nonIssuer).issueCertificate(certHash, student.address)
      ).to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount");
    });

    it("Should reject duplicate certificate hashes", async function () {
      await contract.connect(issuer).issueCertificate(certHash, student.address);
      await expect(
        contract.connect(issuer).issueCertificate(certHash, student.address)
      ).to.be.revertedWith("Certificate already exists");
    });
  });

  describe("Verification", function () {
    it("Should return correct status for valid certificate", async function () {
      await contract.connect(issuer).issueCertificate(certHash, student.address);
      const [exists, revoked, issuerAddr, issuedAt] = await contract.isValid(certHash);
      expect(exists).to.be.true;
      expect(revoked).to.be.false;
      expect(issuerAddr).to.equal(issuer.address);
    });

    it("Should return exists=false for unknown certificate", async function () {
      const randomHash = hre.ethers.id("random");
      const [exists] = await contract.isValid(randomHash);
      expect(exists).to.be.false;
    });
  });

  describe("Revocation", function () {
    beforeEach(async function () {
      await contract.connect(issuer).issueCertificate(certHash, student.address);
    });

    it("Should allow issuer to revoke a certificate", async function () {
      await expect(contract.connect(issuer).revokeCertificate(certHash))
        .to.emit(contract, "Revoked")
        .withArgs(certHash, issuer.address, (val) => val > 0);

      const [exists, revoked] = await contract.isValid(certHash);
      expect(exists).to.be.true;
      expect(revoked).to.be.true;
    });

    it("Should not allow non-issuer to revoke", async function () {
      await expect(
        contract.connect(nonIssuer).revokeCertificate(certHash)
      ).to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount");
    });

    it("Should reject revocation of non-existent certificate", async function () {
      const randomHash = hre.ethers.id("random");
      await expect(
        contract.connect(issuer).revokeCertificate(randomHash)
      ).to.be.revertedWith("Certificate does not exist");
    });

    it("Should reject double revocation", async function () {
      await contract.connect(issuer).revokeCertificate(certHash);
      await expect(
        contract.connect(issuer).revokeCertificate(certHash)
      ).to.be.revertedWith("Certificate already revoked");
    });
  });
});
