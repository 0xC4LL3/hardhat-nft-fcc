// Third time coding a test with no guidance :D
// 1. Check that constructor does the initialization correctly; ✔
// 2. Check that mintNft updates the counter, the mapping and emits the CreatedNft event; ✔
// 3. Check that tokenURI outputs the correct json or reverts. ✔

const { assert, expect } = require("chai")
const { network, getNamedAccounts, ethers, deployments } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const fs = require("fs")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Dynamic SVG NFT Unit Tests", function () {
          let deployer, dynamicSvgNft

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer)
              mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
          })

          describe("constructor", function () {
              it("should initialize correctly", async function () {
                  const tokenCounter = await dynamicSvgNft.getTokenCounter()
                  const lowImageUri = await dynamicSvgNft.getLowImageUri()
                  const highImageUri = await dynamicSvgNft.getHighImageUri()
                  const lowSvg = await fs.readFileSync("./images/dynamicNft/frown.svg", {
                      encoding: "utf8",
                  })
                  const highSvg = await fs.readFileSync("./images/dynamicNft/happy.svg", {
                      encoding: "utf8",
                  })
                  assert.equal(tokenCounter.toString(), "0")
                  assert.equal(
                      lowImageUri.toString(),
                      (await dynamicSvgNft.svgToImageUri(lowSvg)).toString()
                  )
                  assert.equal(
                      highImageUri.toString(),
                      (await dynamicSvgNft.svgToImageUri(highSvg)).toString()
                  )
                  assert((await dynamicSvgNft.getPriceFeed()).toString() !== "")
              })
          })
          describe("mintNft", function () {
              it("should update mapping counter and emit event", async function () {
                  await new Promise(async (resolve, reject) => {
                      dynamicSvgNft.once("CreatedNft", async function () {
                          try {
                              const highValue = await dynamicSvgNft.getTokenIdToHighValue(0)
                              const tokenCounter = await dynamicSvgNft.getTokenCounter()
                              assert.equal(highValue.toString(), ethers.utils.parseEther("4000"))
                              assert.equal(tokenCounter.toString(), "2")
                              resolve()
                          } catch (error) {
                              console.log(error)
                              reject(error)
                          }
                      })
                      try {
                          await dynamicSvgNft.mintNft(ethers.utils.parseEther("4000"))
                      } catch (error) {
                          console.log(error)
                          reject(error)
                      }
                  })
              })
          })
          describe("tokenURI", function () {
              it("should revert when nonexistent tokenId is passed as parameter", async function () {
                  await expect(dynamicSvgNft.tokenURI(5)).to.be.revertedWith(
                      "URI Query for nonexistent token"
                  )
              })
              it("returns the correct token URI", async function () {
                  const tokenURI = await dynamicSvgNft.tokenURI(0)
                  await expect(tokenURI.toString()).to.include("data:application/json;base64,")
              })
          })
      })
