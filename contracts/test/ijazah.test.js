const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('IjazahNFT', function () {
  let ijazahNFT
  let admin, issuer, recipient, otherAccount

  // Role constants (must match contract)
  const ISSUER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('ISSUER_ROLE'))
  const DEFAULT_ADMIN_ROLE = ethers.ZeroHash

  beforeEach(async function () {
    ;[admin, issuer, recipient, otherAccount] = await ethers.getSigners()
    const IjazahNFT = await ethers.getContractFactory('IjazahNFT')
    ijazahNFT = await IjazahNFT.deploy(admin.address)
    await ijazahNFT.waitForDeployment()
  })

  describe('Deployment', function () {
    it('should set the correct name and symbol', async function () {
      const name = await ijazahNFT.name()
      const symbol = await ijazahNFT.symbol()

      expect(name).to.equal('Ijazah Digital')
      expect(symbol).to.equal('IJAZAH')
    })

    it('should grant admin role to deployer', async function () {
      const hasAdminRole = await ijazahNFT.hasRole(
        DEFAULT_ADMIN_ROLE,
        admin.address,
      )
      expect(hasAdminRole).to.be.true
    })

    it('should grant issuer role to deployer', async function () {
      const hasIssuerRole = await ijazahNFT.hasRole(ISSUER_ROLE, admin.address)
      expect(hasIssuerRole).to.be.true
    })
  })

  describe('Issuer Management', function () {
    it('should allow admin to add new issuer', async function () {
      await ijazahNFT.connect(admin).addIssuer(issuer.address)
      const isIssuerNow = await ijazahNFT.isIssuer(issuer.address)
      expect(isIssuerNow).to.be.true
    })

    it('should allow admin to remove issuer', async function () {
      await ijazahNFT.connect(admin).addIssuer(issuer.address)
      await ijazahNFT.connect(admin).removeIssuer(issuer.address)
      const isIssuerNow = await ijazahNFT.isIssuer(issuer.address)
      expect(isIssuerNow).to.be.false
    })

    it('should not allow non-admin to add issuer', async function () {
      await expect(ijazahNFT.connect(otherAccount).addIssuer(issuer.address)).to
        .be.reverted
    })
  })

  describe('Diploma Issuance', function () {
    const documentHash = ethers.keccak256(
      ethers.toUtf8Bytes('diploma content hash'),
    )
    const cid = 'ipfs://QmTestHash123'
    const signature = '0x1234567890abcdef'
    const studentName = 'John Doe'
    const nim = '202300001'

    it('should issue a diploma successfully', async function () {
      const tx = await ijazahNFT
        .connect(admin)
        .issueDiploma(
          recipient.address,
          documentHash,
          cid,
          signature,
          studentName,
          nim,
        )
      const receipt = await tx.wait()

      // Check event emission
      const event = receipt.logs.find(
        (log) => ijazahNFT.interface.parseLog(log)?.name === 'DiplomaIssued',
      )
      expect(event).to.not.be.undefined

      const parsedEvent = ijazahNFT.interface.parseLog(event)
      expect(parsedEvent.args.recipient).to.equal(recipient.address)
      expect(parsedEvent.args.issuer).to.equal(admin.address)
      expect(parsedEvent.args.documentHash).to.equal(documentHash)
      expect(parsedEvent.args.cid).to.equal(cid)
      expect(parsedEvent.args.studentName).to.equal(studentName)
      expect(parsedEvent.args.nim).to.equal(nim)

      // Check token ownership
      const diplomaId = parsedEvent.args.diplomaId
      const tokenOwner = await ijazahNFT.ownerOf(diplomaId)
      expect(tokenOwner).to.equal(recipient.address)
    })

    it('should store diploma data correctly', async function () {
      const tx = await ijazahNFT
        .connect(admin)
        .issueDiploma(
          recipient.address,
          documentHash,
          cid,
          signature,
          studentName,
          nim,
        )
      const receipt = await tx.wait()

      const event = receipt.logs.find(
        (log) => ijazahNFT.interface.parseLog(log)?.name === 'DiplomaIssued',
      )
      const parsedEvent = ijazahNFT.interface.parseLog(event)
      const diplomaId = parsedEvent.args.diplomaId

      const details = await ijazahNFT.getDiplomaDetails(diplomaId)
      expect(details.owner).to.equal(recipient.address)
      expect(details.diploma.documentHash).to.equal(documentHash)
      expect(details.diploma.cid).to.equal(cid)
      expect(details.diploma.issuer).to.equal(admin.address)
      expect(details.diploma.isActive).to.be.true
    })

    it('should only allow issuers to issue diplomas', async function () {
      await expect(
        ijazahNFT
          .connect(otherAccount)
          .issueDiploma(
            recipient.address,
            documentHash,
            cid,
            signature,
            studentName,
            nim,
          ),
      ).to.be.reverted
    })

    it('should increment diploma IDs', async function () {
      const tx1 = await ijazahNFT
        .connect(admin)
        .issueDiploma(
          recipient.address,
          documentHash,
          cid,
          signature,
          studentName,
          nim,
        )
      const receipt1 = await tx1.wait()

      const tx2 = await ijazahNFT
        .connect(admin)
        .issueDiploma(
          recipient.address,
          ethers.keccak256(ethers.toUtf8Bytes('another diploma')),
          'ipfs://QmAnotherHash',
          '0xabcdef',
          'Jane Smith',
          '202300002',
        )
      const receipt2 = await tx2.wait()

      const event1 = receipt1.logs.find(
        (log) => ijazahNFT.interface.parseLog(log)?.name === 'DiplomaIssued',
      )
      const event2 = receipt2.logs.find(
        (log) => ijazahNFT.interface.parseLog(log)?.name === 'DiplomaIssued',
      )

      const id1 = ijazahNFT.interface.parseLog(event1).args.diplomaId
      const id2 = ijazahNFT.interface.parseLog(event2).args.diplomaId

      expect(Number(id2)).to.equal(Number(id1) + 1)
    })
  })

  describe('Diploma Revocation', function () {
    let diplomaId
    const documentHash = ethers.keccak256(
      ethers.toUtf8Bytes('diploma content hash'),
    )
    const cid = 'ipfs://QmTestHash123'
    const signature = '0x1234567890abcdef'
    const studentName = 'Test Student'
    const nim = '202300099'
    const revocationReason = 'Credential fraud detected'

    beforeEach(async function () {
      const tx = await ijazahNFT
        .connect(admin)
        .issueDiploma(
          recipient.address,
          documentHash,
          cid,
          signature,
          studentName,
          nim,
        )
      const receipt = await tx.wait()
      const event = receipt.logs.find(
        (log) => ijazahNFT.interface.parseLog(log)?.name === 'DiplomaIssued',
      )
      diplomaId = ijazahNFT.interface.parseLog(event).args.diplomaId
    })

    it('should revoke a diploma successfully', async function () {
      const tx = await ijazahNFT
        .connect(admin)
        .revokeDiploma(diplomaId, revocationReason)
      const receipt = await tx.wait()

      // Check event emission
      const event = receipt.logs.find(
        (log) => ijazahNFT.interface.parseLog(log)?.name === 'DiplomaRevoked',
      )
      expect(event).to.not.be.undefined

      const parsedEvent = ijazahNFT.interface.parseLog(event)
      expect(parsedEvent.args.diplomaId.toString()).to.equal(
        diplomaId.toString(),
      )
      expect(parsedEvent.args.revoker).to.equal(admin.address)
      expect(parsedEvent.args.reason).to.equal(revocationReason)

      // Check diploma status
      const details = await ijazahNFT.getDiplomaDetails(diplomaId)
      expect(details.diploma.isActive).to.be.false
    })

    it('should store revocation reason', async function () {
      await ijazahNFT.connect(admin).revokeDiploma(diplomaId, revocationReason)
      const storedReason = await ijazahNFT.revocationReasons(diplomaId)
      expect(storedReason).to.equal(revocationReason)
    })

    it('should not allow revoking twice', async function () {
      await ijazahNFT.connect(admin).revokeDiploma(diplomaId, revocationReason)

      await expect(
        ijazahNFT.connect(admin).revokeDiploma(diplomaId, 'Another reason'),
      ).to.be.revertedWith('Diploma already revoked')
    })

    it('should not allow non-issuers to revoke', async function () {
      await expect(
        ijazahNFT
          .connect(otherAccount)
          .revokeDiploma(diplomaId, revocationReason),
      ).to.be.reverted
    })
  })

  describe('Diploma Verification', function () {
    let diplomaId
    const documentHash = ethers.keccak256(
      ethers.toUtf8Bytes('diploma content hash'),
    )
    const cid = 'ipfs://QmTestHash123'
    const signature = '0x1234567890abcdef'
    const studentName = 'Verify Student'
    const nim = '202300088'

    beforeEach(async function () {
      const tx = await ijazahNFT
        .connect(admin)
        .issueDiploma(
          recipient.address,
          documentHash,
          cid,
          signature,
          studentName,
          nim,
        )
      const receipt = await tx.wait()
      const event = receipt.logs.find(
        (log) => ijazahNFT.interface.parseLog(log)?.name === 'DiplomaIssued',
      )
      diplomaId = ijazahNFT.interface.parseLog(event).args.diplomaId
    })

    it('should verify active diploma as valid and active', async function () {
      const result = await ijazahNFT.verifyDiploma(diplomaId)
      expect(result.isValid).to.be.true
      expect(result.isActive).to.be.true
    })

    it('should verify revoked diploma as valid but not active', async function () {
      await ijazahNFT.connect(admin).revokeDiploma(diplomaId, 'Test revocation')

      const result = await ijazahNFT.verifyDiploma(diplomaId)
      expect(result.isValid).to.be.true
      expect(result.isActive).to.be.false
    })

    it('should verify non-existent diploma as invalid', async function () {
      const result = await ijazahNFT.verifyDiploma(999)
      expect(result.isValid).to.be.false
      expect(result.isActive).to.be.false
    })

    it('should verify hash correctly', async function () {
      const isMatch = await ijazahNFT.verifyHash(diplomaId, documentHash)
      expect(isMatch).to.be.true

      const wrongHash = ethers.keccak256(ethers.toUtf8Bytes('wrong content'))
      const isWrongMatch = await ijazahNFT.verifyHash(diplomaId, wrongHash)
      expect(isWrongMatch).to.be.false
    })
  })

  describe('Total Diplomas Counter', function () {
    const documentHash = ethers.keccak256(
      ethers.toUtf8Bytes('diploma content hash'),
    )
    const cid = 'ipfs://QmTestHash123'
    const signature = '0x1234567890abcdef'
    const studentName = 'Counter Student'
    const nim = '202300077'

    it('should track total diplomas issued', async function () {
      const initialCount = await ijazahNFT.getTotalDiplomas()
      expect(Number(initialCount)).to.equal(0)

      await ijazahNFT
        .connect(admin)
        .issueDiploma(
          recipient.address,
          documentHash,
          cid,
          signature,
          studentName,
          nim,
        )
      const countAfterOne = await ijazahNFT.getTotalDiplomas()
      expect(Number(countAfterOne)).to.equal(1)

      await ijazahNFT
        .connect(admin)
        .issueDiploma(
          recipient.address,
          documentHash,
          cid,
          signature,
          'Second Student',
          '202300078',
        )
      const countAfterTwo = await ijazahNFT.getTotalDiplomas()
      expect(Number(countAfterTwo)).to.equal(2)
    })
  })

  describe('ERC721 Standard Compliance', function () {
    let diplomaId
    const documentHash = ethers.keccak256(
      ethers.toUtf8Bytes('diploma content hash'),
    )
    const cid = 'ipfs://QmTestHash123'
    const signature = '0x1234567890abcdef'
    const studentName = 'ERC721 Student'
    const nim = '202300066'

    beforeEach(async function () {
      const tx = await ijazahNFT
        .connect(admin)
        .issueDiploma(
          recipient.address,
          documentHash,
          cid,
          signature,
          studentName,
          nim,
        )
      const receipt = await tx.wait()
      const event = receipt.logs.find(
        (log) => ijazahNFT.interface.parseLog(log)?.name === 'DiplomaIssued',
      )
      diplomaId = ijazahNFT.interface.parseLog(event).args.diplomaId
    })

    it('should support ERC721 interface', async function () {
      // ERC721 interface ID: 0x80ac58cd
      const supportsERC721 = await ijazahNFT.supportsInterface('0x80ac58cd')
      expect(supportsERC721).to.be.true
    })

    it('should support AccessControl interface', async function () {
      // AccessControl interface ID: 0x7965db0b
      const supportsAccessControl =
        await ijazahNFT.supportsInterface('0x7965db0b')
      expect(supportsAccessControl).to.be.true
    })

    it('should allow token transfer', async function () {
      await ijazahNFT
        .connect(recipient)
        .transferFrom(recipient.address, otherAccount.address, diplomaId)

      const newOwner = await ijazahNFT.ownerOf(diplomaId)
      expect(newOwner).to.equal(otherAccount.address)
    })

    it('should return correct token URI', async function () {
      const uri = await ijazahNFT.tokenURI(diplomaId)
      expect(uri).to.equal(cid)
    })
  })
})
