// First time coding a test with no guidance :)
// 1. Check if constructor correctly sets s_tokenCounter = 0; ✔
// 2. Check if mint function works and increases s_tokenCounter; ✔

const { assert } = require("chai")
const { network, getNamedAccounts, ethers, deployments } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("BasicNft Unit Tests", function () {
          let deployer, basicNft

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              basicNft = await ethers.getContract("BasicNft", deployer)
          })

          describe("constructor", function () {
              it("sets token counter to 0", async function () {
                  tokenCounter = await basicNft.getTokenCounter()
                  assert.equal(tokenCounter.toString(), "0")
              })
          })

          describe("mintNft", function () {
              it("mints and increases token counter afterwards", async function () {
                  tokenCounterBefore = await basicNft.getTokenCounter()
                  const txResponse = await basicNft.mintNft()
                  await txResponse.wait(1)
                  const tokenURI = await basicNft.tokenURI(0)
                  tokenCounterAfter = await basicNft.getTokenCounter()
                  assert.equal(tokenURI, await basicNft.TOKEN_URI())
                  assert.equal(
                      tokenCounterAfter.toString(),
                      (tokenCounterBefore.toNumber() + 1).toString()
                  )
              })
          })
      })
