// We will use a mock IPFS implementation by default for development.
// If VITE_PINATA_API_KEY and VITE_PINATA_SECRET_KEY are provided, it will use Pinata.

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

const mockStorage = new Map();

export async function uploadCertificate(file, metadata) {
  if (PINATA_JWT) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const pinataMetadata = JSON.stringify({
        name: metadata.student.name + ' - Certificate',
      });
      formData.append('pinataMetadata', pinataMetadata);

      const pinataOptions = JSON.stringify({
        cidVersion: 0,
      });
      formData.append('pinataOptions', pinataOptions);

      const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: formData,
      });
      
      const resData = await res.json();
      return resData.IpfsHash;
    } catch (error) {
      console.error("Error uploading to Pinata", error);
      throw error;
    }
  } else {
    // Mock Implementation
    console.warn("Using Mock IPFS Storage. Provide VITE_PINATA_JWT to use real IPFS.");
    const mockCid = "QmMock" + Math.random().toString(36).substring(2, 15);
    const url = URL.createObjectURL(file);
    mockStorage.set(mockCid, url);
    return mockCid;
  }
}

export async function getCertificateUrl(cid) {
  if (PINATA_JWT || !cid.startsWith("QmMock")) {
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  } else {
    return mockStorage.get(cid) || null;
  }
}
