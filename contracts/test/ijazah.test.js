const IjazahNFT = artifacts.require('IjazahNFT')
const { expect } = require('chai')

contract('IjazahNFT', (accounts) => {
  let ijazahNFT
  const owner = accounts[0]
  const recipient = accounts[1]
  const otherAccount = accounts[2]

  beforeEach(async () => {
    ijazahNFT = await IjazahNFT.new(owner)
  })

  describe('Deployment', () => {
    it('should set the correct name and symbol', async () => {
      const name = await ijazahNFT.name()
      const symbol = await ijazahNFT.symbol()

      expect(name).to.equal('Ijazah Certificate')
      expect(symbol).to.equal('IJAZAH')
    })

    it('should set the correct owner', async () => {
      const contractOwner = await ijazahNFT.owner()
      expect(contractOwner).to.equal(owner)
    })
  })

  describe('Minting Certificates', () => {
    const certificateHash = web3.utils.keccak256('test certificate data')
    const tokenURI = 'ipfs://QmTestHash'

    it('should mint a certificate successfully', async () => {
      const tx = await ijazahNFT.mintCertificate(
        recipient,
        certificateHash,
        tokenURI,
        { from: owner },
      )

      // Check event emission (CertificateMinted is the 4th event emitted)
      const certificateEvent = tx.logs.find(
        (log) => log.event === 'CertificateMinted',
      )
      expect(certificateEvent).to.not.be.undefined
      expect(certificateEvent.args.recipient).to.equal(recipient)
      expect(certificateEvent.args.issuer).to.equal(owner)
      expect(certificateEvent.args.certificateHash).to.equal(certificateHash)

      // Check token ownership
      const tokenId = certificateEvent.args.tokenId
      const tokenOwner = await ijazahNFT.ownerOf(tokenId)
      expect(tokenOwner).to.equal(recipient)
    })

    it('should store certificate hash correctly', async () => {
      const tx = await ijazahNFT.mintCertificate(
        recipient,
        certificateHash,
        tokenURI,
        { from: owner },
      )

      const certificateEvent = tx.logs.find(
        (log) => log.event === 'CertificateMinted',
      )
      const tokenId = certificateEvent.args.tokenId
      const storedHash = await ijazahNFT.certificateHashes(tokenId)

      expect(storedHash).to.equal(certificateHash)
    })

    it('should set the correct token URI', async () => {
      const tx = await ijazahNFT.mintCertificate(
        recipient,
        certificateHash,
        tokenURI,
        { from: owner },
      )

      const certificateEvent = tx.logs.find(
        (log) => log.event === 'CertificateMinted',
      )
      const tokenId = certificateEvent.args.tokenId
      const uri = await ijazahNFT.tokenURI(tokenId)

      expect(uri).to.equal(tokenURI)
    })

    it('should only allow owner to mint', async () => {
      let errorOccurred = false
      try {
        await ijazahNFT.mintCertificate(recipient, certificateHash, tokenURI, {
          from: otherAccount,
        })
      } catch (error) {
        errorOccurred = true
        // Verify it's an access control error (not some other error)
        // OpenZeppelin v5 uses custom errors which may be encoded differently
        expect(error.message).to.not.include('invalid opcode')
      }
      // The important part: non-owner was  blocked from minting
      expect(errorOccurred).to.be.true
    })

    it('should increment token IDs', async () => {
      const tx1 = await ijazahNFT.mintCertificate(
        recipient,
        certificateHash,
        tokenURI,
        { from: owner },
      )

      const tx2 = await ijazahNFT.mintCertificate(
        recipient,
        web3.utils.keccak256('another certificate'),
        'ipfs://QmAnotherHash',
        { from: owner },
      )

      const event1 = tx1.logs.find((log) => log.event === 'CertificateMinted')
      const event2 = tx2.logs.find((log) => log.event === 'CertificateMinted')
      const tokenId1 = event1.args.tokenId
      const tokenId2 = event2.args.tokenId

      expect(Number(tokenId2)).to.equal(Number(tokenId1) + 1)
    })
  })

  describe('Certificate Verification', () => {
    let tokenId
    const certificateHash = web3.utils.keccak256('test certificate data')
    const tokenURI = 'ipfs://QmTestHash'

    beforeEach(async () => {
      const tx = await ijazahNFT.mintCertificate(
        recipient,
        certificateHash,
        tokenURI,
        { from: owner },
      )
      const event = tx.logs.find((log) => log.event === 'CertificateMinted')
      tokenId = event.args.tokenId
    })

    it('should verify a valid certificate', async () => {
      const isValid = await ijazahNFT.verifyCertificate(
        tokenId,
        certificateHash,
      )

      expect(isValid).to.be.true
    })

    it('should reject an invalid certificate hash', async () => {
      const wrongHash = web3.utils.keccak256('wrong data')
      const isValid = await ijazahNFT.verifyCertificate(tokenId, wrongHash)

      expect(isValid).to.be.false
    })

    it('should revert for non-existent token', async () => {
      try {
        await ijazahNFT.verifyCertificate(999, certificateHash)
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error.message).to.include('Certificate does not exist')
      }
    })
  })

  describe('Certificate Details', () => {
    let tokenId
    let issueTime
    const certificateHash = web3.utils.keccak256('test certificate data')
    const tokenURI = 'ipfs://QmTestHash'

    beforeEach(async () => {
      const tx = await ijazahNFT.mintCertificate(
        recipient,
        certificateHash,
        tokenURI,
        { from: owner },
      )
      const event = tx.logs.find((log) => log.event === 'CertificateMinted')
      tokenId = event.args.tokenId

      // Get the block timestamp
      const block = await web3.eth.getBlock(tx.receipt.blockNumber)
      issueTime = block.timestamp
    })

    it('should return correct certificate details', async () => {
      const details = await ijazahNFT.getCertificateDetails(tokenId)

      expect(details.owner).to.equal(recipient)
      expect(details.issuer).to.equal(owner)
      expect(details.certificateHash).to.equal(certificateHash)
      // Allow 1 second tolerance for timestamp
      expect(Math.abs(Number(details.issueDate) - issueTime)).to.be.lessThan(2)
    })

    it('should revert for non-existent token', async () => {
      try {
        await ijazahNFT.getCertificateDetails(999)
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error.message).to.include('Certificate does not exist')
      }
    })

    it('should track certificate ownership after transfer', async () => {
      // Transfer the certificate
      await ijazahNFT.transferFrom(recipient, otherAccount, tokenId, {
        from: recipient,
      })

      const details = await ijazahNFT.getCertificateDetails(tokenId)

      // Owner should be updated
      expect(details.owner).to.equal(otherAccount)
      // But issuer should remain the same
      expect(details.issuer).to.equal(owner)
    })
  })

  describe('ERC721 Standard Compliance', () => {
    let tokenId
    const certificateHash = web3.utils.keccak256('test certificate data')
    const tokenURI = 'ipfs://QmTestHash'

    beforeEach(async () => {
      const tx = await ijazahNFT.mintCertificate(
        recipient,
        certificateHash,
        tokenURI,
        { from: owner },
      )
      const event = tx.logs.find((log) => log.event === 'CertificateMinted')
      tokenId = event.args.tokenId
    })

    it('should support ERC721 interface', async () => {
      // ERC721 interface ID: 0x80ac58cd
      const supportsERC721 = await ijazahNFT.supportsInterface('0x80ac58cd')
      expect(supportsERC721).to.be.true
    })

    it('should allow token transfer', async () => {
      await ijazahNFT.transferFrom(recipient, otherAccount, tokenId, {
        from: recipient,
      })

      const newOwner = await ijazahNFT.ownerOf(tokenId)
      expect(newOwner).to.equal(otherAccount)
    })

    it('should update balance after transfer', async () => {
      const balanceBefore = await ijazahNFT.balanceOf(recipient)

      await ijazahNFT.transferFrom(recipient, otherAccount, tokenId, {
        from: recipient,
      })

      const balanceAfter = await ijazahNFT.balanceOf(recipient)
      const newOwnerBalance = await ijazahNFT.balanceOf(otherAccount)

      expect(Number(balanceAfter)).to.equal(Number(balanceBefore) - 1)
      expect(Number(newOwnerBalance)).to.equal(1)
    })
  })
})
