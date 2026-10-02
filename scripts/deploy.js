import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("Deploying CertificateVerifier contract...");
  
  const CertificateVerifier = await hre.ethers.getContractFactory("CertificateVerifier");
  const contract = await CertificateVerifier.deploy();
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log("CertificateVerifier deployed to:", address);
  console.log("Network:", hre.network.name);

  // Save the contract's address and ABI for the frontend
  const frontendDir = path.join(__dirname, "..", "frontend", "src", "contracts");
  
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  const data = {
    address: address,
    abi: JSON.parse(contract.interface.formatJson())
  };

  fs.writeFileSync(
    path.join(frontendDir, "CertificateVerifier.json"),
    JSON.stringify(data, null, 2)
  );
  console.log("Contract data saved to frontend");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
