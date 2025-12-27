const IjazahNFT = artifacts.require('IjazahNFT')
const { expect } = require('chai')

contract('IjazahNFT', (accounts) => {
  let ijazahNFT
  const admin = accounts[0]
  const issuer = accounts[1]
  const recipient = accounts[2]
  const otherAccount = accounts[3]

  // Role constants (must match contract)
  const ISSUER_ROLE = web3.utils.keccak256('ISSUER_ROLE')
  const DEFAULT_ADMIN_ROLE =
    '0x0000000000000000000000000000000000000000000000000000000000000000'

  beforeEach(async () => {
    ijazahNFT = await IjazahNFT.new(admin)
  })

  describe('Deployment', () => {
    it('should set the correct name and symbol', async () => {
      const name = await ijazahNFT.name()
      const symbol = await ijazahNFT.symbol()

      expect(name).to.equal('Ijazah Digital')
      expect(symbol).to.equal('IJAZAH')
    })

    it('should grant admin role to deployer', async () => {
      const hasAdminRole = await ijazahNFT.hasRole(DEFAULT_ADMIN_ROLE, admin)
      expect(hasAdminRole).to.be.true
    })

    it('should grant issuer role to deployer', async () => {
      const hasIssuerRole = await ijazahNFT.hasRole(ISSUER_ROLE, admin)
      expect(hasIssuerRole).to.be.true
    })
  })

  describe('Issuer Management', () => {
    it('should allow admin to add new issuer', async () => {
      await ijazahNFT.addIssuer(issuer, { from: admin })
      const isIssuerNow = await ijazahNFT.isIssuer(issuer)
      expect(isIssuerNow).to.be.true
    })

    it('should allow admin to remove issuer', async () => {
      await ijazahNFT.addIssuer(issuer, { from: admin })
      await ijazahNFT.removeIssuer(issuer, { from: admin })
      const isIssuerNow = await ijazahNFT.isIssuer(issuer)
      expect(isIssuerNow).to.be.false
    })

    it('should not allow non-admin to add issuer', async () => {
      let errorOccurred = false
      try {
        await ijazahNFT.addIssuer(issuer, { from: otherAccount })
      } catch (error) {
        errorOccurred = true
      }
      expect(errorOccurred).to.be.true
    })
  })

  describe('Diploma Issuance', () => {
    const documentHash = web3.utils.keccak256('diploma content hash')
    const cid = 'ipfs://QmTestHash123'
    const signature = '0x1234567890abcdef'
    const studentName = 'John Doe'
    const nim = '202300001'

    it('should issue a diploma successfully', async () => {
      const tx = await ijazahNFT.issueDiploma(
        recipient,
        documentHash,
        cid,
        signature,
        studentName,
        nim,
        { from: admin },
      )

      // Check event emission
      const event = tx.logs.find((log) => log.event === 'DiplomaIssued')
      expect(event).to.not.be.undefined
      expect(event.args.recipient).to.equal(recipient)
      expect(event.args.issuer).to.equal(admin)
      expect(event.args.documentHash).to.equal(documentHash)
      expect(event.args.cid).to.equal(cid)
      expect(event.args.studentName).to.equal(studentName)
      expect(event.args.nim).to.equal(nim)

      // Check token ownership
      const diplomaId = event.args.diplomaId
      const tokenOwner = await ijazahNFT.ownerOf(diplomaId)
      expect(tokenOwner).to.equal(recipient)
    })

    it('should store diploma data correctly', async () => {
      const tx = await ijazahNFT.issueDiploma(
        recipient,
        documentHash,
        cid,
        signature,
        studentName,
        nim,
        { from: admin },
      )

      const event = tx.logs.find((log) => log.event === 'DiplomaIssued')
      const diplomaId = event.args.diplomaId

      const details = await ijazahNFT.getDiplomaDetails(diplomaId)
      expect(details.owner).to.equal(recipient)
      expect(details.diploma.documentHash).to.equal(documentHash)
      expect(details.diploma.cid).to.equal(cid)
      expect(details.diploma.issuer).to.equal(admin)
      expect(details.diploma.isActive).to.be.true
    })

    it('should only allow issuers to issue diplomas', async () => {
      let errorOccurred = false
      try {
        await ijazahNFT.issueDiploma(
          recipient,
          documentHash,
          cid,
          signature,
          studentName,
          nim,
          {
            from: otherAccount,
          },
        )
      } catch (error) {
        errorOccurred = true
      }
      expect(errorOccurred).to.be.true
    })

    it('should increment diploma IDs', async () => {
      const tx1 = await ijazahNFT.issueDiploma(
        recipient,
        documentHash,
        cid,
        signature,
        studentName,
        nim,
        { from: admin },
      )

      const tx2 = await ijazahNFT.issueDiploma(
        recipient,
        web3.utils.keccak256('another diploma'),
        'ipfs://QmAnotherHash',
        '0xabcdef',
        'Jane Smith',
        '202300002',
        { from: admin },
      )

      const event1 = tx1.logs.find((log) => log.event === 'DiplomaIssued')
      const event2 = tx2.logs.find((log) => log.event === 'DiplomaIssued')

      expect(Number(event2.args.diplomaId)).to.equal(
        Number(event1.args.diplomaId) + 1,
      )
    })
  })

  describe('Diploma Revocation', () => {
    let diplomaId
    const documentHash = web3.utils.keccak256('diploma content hash')
    const cid = 'ipfs://QmTestHash123'
    const signature = '0x1234567890abcdef'
    const studentName = 'Test Student'
    const nim = '202300099'
    const revocationReason = 'Credential fraud detected'

    beforeEach(async () => {
      const tx = await ijazahNFT.issueDiploma(
        recipient,
        documentHash,
        cid,
        signature,
        studentName,
        nim,
        { from: admin },
      )
      const event = tx.logs.find((log) => log.event === 'DiplomaIssued')
      diplomaId = event.args.diplomaId
    })

    it('should revoke a diploma successfully', async () => {
      const tx = await ijazahNFT.revokeDiploma(diplomaId, revocationReason, {
        from: admin,
      })

      // Check event emission
      const event = tx.logs.find((log) => log.event === 'DiplomaRevoked')
      expect(event).to.not.be.undefined
      expect(event.args.diplomaId.toString()).to.equal(diplomaId.toString())
      expect(event.args.revoker).to.equal(admin)
      expect(event.args.reason).to.equal(revocationReason)

      // Check diploma status
      const details = await ijazahNFT.getDiplomaDetails(diplomaId)
      expect(details.diploma.isActive).to.be.false
    })

    it('should store revocation reason', async () => {
      await ijazahNFT.revokeDiploma(diplomaId, revocationReason, {
        from: admin,
      })
      const storedReason = await ijazahNFT.revocationReasons(diplomaId)
      expect(storedReason).to.equal(revocationReason)
    })

    it('should not allow revoking twice', async () => {
      await ijazahNFT.revokeDiploma(diplomaId, revocationReason, {
        from: admin,
      })

      let errorOccurred = false
      try {
        await ijazahNFT.revokeDiploma(diplomaId, 'Another reason', {
          from: admin,
        })
      } catch (error) {
        errorOccurred = true
        expect(error.message).to.include('already revoked')
      }
      expect(errorOccurred).to.be.true
    })

    it('should not allow non-issuers to revoke', async () => {
      let errorOccurred = false
      try {
        await ijazahNFT.revokeDiploma(diplomaId, revocationReason, {
          from: otherAccount,
        })
      } catch (error) {
        errorOccurred = true
      }
      expect(errorOccurred).to.be.true
    })
  })

  describe('Diploma Verification', () => {
    let diplomaId
    const documentHash = web3.utils.keccak256('diploma content hash')
    const cid = 'ipfs://QmTestHash123'
    const signature = '0x1234567890abcdef'
    const studentName = 'Verify Student'
    const nim = '202300088'

    beforeEach(async () => {
      const tx = await ijazahNFT.issueDiploma(
        recipient,
        documentHash,
        cid,
        signature,
        studentName,
        nim,
        { from: admin },
      )
      const event = tx.logs.find((log) => log.event === 'DiplomaIssued')
      diplomaId = event.args.diplomaId
    })

    it('should verify active diploma as valid and active', async () => {
      const result = await ijazahNFT.verifyDiploma(diplomaId)
      expect(result.isValid).to.be.true
      expect(result.isActive).to.be.true
    })

    it('should verify revoked diploma as valid but not active', async () => {
      await ijazahNFT.revokeDiploma(diplomaId, 'Test revocation', {
        from: admin,
      })

      const result = await ijazahNFT.verifyDiploma(diplomaId)
      expect(result.isValid).to.be.true
      expect(result.isActive).to.be.false
    })

    it('should verify non-existent diploma as invalid', async () => {
      const result = await ijazahNFT.verifyDiploma(999)
      expect(result.isValid).to.be.false
      expect(result.isActive).to.be.false
    })

    it('should verify hash correctly', async () => {
      const isMatch = await ijazahNFT.verifyHash(diplomaId, documentHash)
      expect(isMatch).to.be.true

      const wrongHash = web3.utils.keccak256('wrong content')
      const isWrongMatch = await ijazahNFT.verifyHash(diplomaId, wrongHash)
      expect(isWrongMatch).to.be.false
    })
  })

  describe('Total Diplomas Counter', () => {
    const documentHash = web3.utils.keccak256('diploma content hash')
    const cid = 'ipfs://QmTestHash123'
    const signature = '0x1234567890abcdef'
    const studentName = 'Counter Student'
    const nim = '202300077'

    it('should track total diplomas issued', async () => {
      const initialCount = await ijazahNFT.getTotalDiplomas()
      expect(Number(initialCount)).to.equal(0)

      await ijazahNFT.issueDiploma(
        recipient,
        documentHash,
        cid,
        signature,
        studentName,
        nim,
        {
          from: admin,
        },
      )
      const countAfterOne = await ijazahNFT.getTotalDiplomas()
      expect(Number(countAfterOne)).to.equal(1)

      await ijazahNFT.issueDiploma(
        recipient,
        documentHash,
        cid,
        signature,
        'Second Student',
        '202300078',
        {
          from: admin,
        },
      )
      const countAfterTwo = await ijazahNFT.getTotalDiplomas()
      expect(Number(countAfterTwo)).to.equal(2)
    })
  })

  describe('ERC721 Standard Compliance', () => {
    let diplomaId
    const documentHash = web3.utils.keccak256('diploma content hash')
    const cid = 'ipfs://QmTestHash123'
    const signature = '0x1234567890abcdef'
    const studentName = 'ERC721 Student'
    const nim = '202300066'

    beforeEach(async () => {
      const tx = await ijazahNFT.issueDiploma(
        recipient,
        documentHash,
        cid,
        signature,
        studentName,
        nim,
        { from: admin },
      )
      const event = tx.logs.find((log) => log.event === 'DiplomaIssued')
      diplomaId = event.args.diplomaId
    })

    it('should support ERC721 interface', async () => {
      // ERC721 interface ID: 0x80ac58cd
      const supportsERC721 = await ijazahNFT.supportsInterface('0x80ac58cd')
      expect(supportsERC721).to.be.true
    })

    it('should support AccessControl interface', async () => {
      // AccessControl interface ID: 0x7965db0b
      const supportsAccessControl =
        await ijazahNFT.supportsInterface('0x7965db0b')
      expect(supportsAccessControl).to.be.true
    })

    it('should allow token transfer', async () => {
      await ijazahNFT.transferFrom(recipient, otherAccount, diplomaId, {
        from: recipient,
      })

      const newOwner = await ijazahNFT.ownerOf(diplomaId)
      expect(newOwner).to.equal(otherAccount)
    })

    it('should return correct token URI', async () => {
      const uri = await ijazahNFT.tokenURI(diplomaId)
      expect(uri).to.equal(cid)
    })
  })
})
