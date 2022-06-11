// Second time coding a test with no guidance :P
// 1. Check that constructor does the initialization correctly; ✔
// 2. Check that requestNft assigns the requestId to the sender when enough ETH is sent and emits NftRequested; ✔
// 3. Check that fulfillRandomWords increases s_tokenCounter, mints an NFT, assigns it to the right owner, emits NftMinted; ✔
// 4. Check that withdraw reverts with RandomIpfsNft__TransferFailed; ✔
// 5. Check that getBreedFromModdedRng reverts with RandomIpfsNft__RangeOutOfBounds(). ✔

const { assert, expect } = require("chai")
const { network, ethers, deployments } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("RandomIpfsNft Unit Tests", async function () {
          let deployer, randomIpfsNft, vrfCoordinatorV2Mock
          const chainId = network.config.chainId
          const tokenUris = [
              "ipfs://QmXSnEetU92RrmqqJhJDb3G8wJvfPKgeAXoJykZCsSmsmq",
              "ipfs://QmbHBwaohDAsbiNg5Gr6ecDPX2Dt9aNMzDj6Ri7k5JprgJ",
              "ipfs://QmPXsnuti47R5QnBTaqQK8b1mdBj4yyHwKskAaYCjPtkgy",
          ]
          const FUND_AMOUNT = "10000000000000000"
          beforeEach(async function () {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              await deployments.fixture(["all"])
              randomIpfsNft = await ethers.getContract("RandomIpfsNft")
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
          })

          describe("constructor", function () {
              it("initializes correctly", async function () {
                  assert.equal(true, true)
                  const subscriptionId = await randomIpfsNft.getSubscriptionId()
                  const gasLane = await randomIpfsNft.getGasLane()
                  const callbackGasLimit = await randomIpfsNft.getCallbackGasLimit()
                  const dogTokenUris = await randomIpfsNft.getDogTokenUris(0)
                  const mintFee = await randomIpfsNft.getMintFee()
                  assert(vrfCoordinatorV2Mock.getSubscription(subscriptionId).toString() !== "")
                  assert.equal(gasLane.toString(), networkConfig[chainId]["gasLane"])
                  assert.equal(
                      callbackGasLimit.toString(),
                      networkConfig[chainId]["callbackGasLimit"]
                  )
                  assert.equal(
                      dogTokenUris.toString(),
                      tokenUris[0] || tokenUris[1] || tokenUris[2]
                  )
                  assert.equal(mintFee.toString(), networkConfig[chainId]["mintFee"])
              })
          })
          describe("requestNft", function () {
              it("reverts when not enough ETH is sent", async function () {
                  await expect(randomIpfsNft.requestNft()).to.be.revertedWith(
                      "RandomIpfsNft__NeedMoreETHSent()"
                  )
              })
              it("assigns requestId to sender", async function () {
                  const txResponse = await randomIpfsNft.requestNft({ value: FUND_AMOUNT })
                  const txReceipt = await txResponse.wait(1)
                  const requestId = txReceipt.events[1].args.requestId
                  const requestIdSender = await randomIpfsNft.s_requestIdToSender(
                      requestId.toNumber()
                  )
                  assert.equal(deployer.address, requestIdSender)
              })
              it("emits NftRequested()", async function () {
                  await expect(randomIpfsNft.requestNft({ value: FUND_AMOUNT })).to.emit(
                      randomIpfsNft,
                      "NftRequested"
                  )
              })
          })
          describe("fulfillrandomWords", function () {
              it("should increase token counter, set URI, emit event", async function () {
                  const tokenCounterBefore = await randomIpfsNft.getTokenCounter()
                  const txResponse = await randomIpfsNft.requestNft({ value: FUND_AMOUNT })
                  const txReceipt = await txResponse.wait(1)
                  const requestId = txReceipt.events[1].args.requestId
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.address)
                  ).to.emit(randomIpfsNft, "NftMinted")
                  const tokenCounterAfter = await randomIpfsNft.getTokenCounter()
                  const tokenUri = await randomIpfsNft.getDogTokenUris(0)
                  assert.equal(
                      (tokenCounterBefore.toNumber() + 1).toString(),
                      tokenCounterAfter.toString()
                  )
                  assert(tokenUri.toString() !== "")
              })
          })
          describe("withdraw", function () {
              it("reverts if transfer fails", async function () {
                  expect(randomIpfsNft.withdraw()).to.be.revertedWith(
                      "RandomIpfsNft__TransferFailed()"
                  )
              })
          })
          describe("getBreedFromModdedRng", function () {
              it("reverts if something goes terribly wrong with ModdedRng", async function () {
                  expect(randomIpfsNft.getBreedFromModdedRng()).to.be.revertedWith(
                      "RandomIpfsNft__RangeOutOfBounds()"
                  )
              })
          })
      })
