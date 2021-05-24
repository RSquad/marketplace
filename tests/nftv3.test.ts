import { KeyPair, TonClient } from "@tonclient/core";
import { createClient } from "./utils/client";
import TonContract from "./ton-contract";
import { expect } from "chai";
import GiverPackage from "../ton-packages/Giver.package";
import { utf8ToHex } from "./utils/convert";
import NFTpkg from "../ton-packages/NFT.package";
import buySellPackage from "../ton-packages/NftBuySell.package";
import deployMultisig from "./parts/multisig";
import deployNftRootV3 from "./parts/nft-root-v3";

describe("v3 root tests", () => {
  let client: TonClient;
  let smcGiver: TonContract;
  let smcRootTokenContract: TonContract;
  let keys1: KeyPair;
  let keys2: KeyPair;
  let nftAddress1: string;
  let nftAddress2: string;
  let nftHash: string;
  let smcNFT1: TonContract;
  let smcNFT2: TonContract;
  let smcBuySell: TonContract;
  let smcSMW1: TonContract;
  let smcSMW2: TonContract;
  let smcSMW3: TonContract;

  before(async () => {
    client = createClient();
    smcGiver = new TonContract({
      client,
      address: process.env.GIVER_ADDRESS,
      name: "NSEGiver",
      tonPackage: GiverPackage,
    });
  });

  it("deploy RootTokenContract v3", async () => {
    smcRootTokenContract = await deployNftRootV3(client, smcGiver);
  });

  it("deploy 2 miltisig", async () => {
    smcSMW1 = await deployMultisig(client, smcGiver);
    smcSMW2 = await deployMultisig(client, smcGiver);
    smcSMW3 = await deployMultisig(client, smcGiver);
  });

  it("mint new Nft Item", async () => {
    const ownerBefore = await smcRootTokenContract.run({
      functionName: "nftItems",
    });
    expect(0).to.be.equal(Object.entries(ownerBefore.value.nftItems).length);

    const res = await smcRootTokenContract.call({
      functionName: "mint",
      input: {
        data: utf8ToHex("hash of content"),
        name: utf8ToHex("name"),
        linkToken: utf8ToHex("link IPFS"),
      },
    });
    nftHash = res.decoded.output.itemHash;
    console.log(1, nftHash);

    const ownerAfter = await smcRootTokenContract.run({
      functionName: "nftItems",
    });
    expect(1).to.be.equal(Object.entries(ownerAfter.value.nftItems).length);
  });

  it("deploy 2 NFT", async () => {
    keys1 = await client.crypto.generate_random_sign_keys();
    const res = await smcRootTokenContract.call({
      functionName: "deployNFT",
      input: {
        pubkey: `0x${keys1.public}`,
        tons: 10_000_000_000,
      },
    });

    nftAddress1 = res.decoded.output.addr;

    console.log("NFT 1 address", nftAddress1);
    console.log("NFT 1 keys", keys1);
    smcNFT1 = new TonContract({
      client,
      address: nftAddress1,
      name: "smcNFT1",
      tonPackage: NFTpkg,
      keys: keys1,
    });

    keys2 = await client.crypto.generate_random_sign_keys();
    const res2 = await smcRootTokenContract.call({
      functionName: "deployNFT",
      input: {
        pubkey: `0x${keys2.public}`,
        tons: 10_000_000_000,
      },
    });
    nftAddress2 = res2.decoded.output.addr;

    console.log("NFT 2 address", nftAddress2);
    console.log("NFT 2 keys", keys2);
    smcNFT2 = new TonContract({
      client,
      address: nftAddress2,
      name: "smcNFT2",
      tonPackage: NFTpkg,
      keys: keys2,
    });
  });

  it("grant item to wallet1", async () => {
    const beforeRoot = await smcRootTokenContract.run({
      functionName: "nftItems",
    });
    expect(1).to.be.equal(Object.entries(beforeRoot.value.nftItems).length);

    const beforesmcNFT1 = await smcNFT1.run({
      functionName: "nftItems",
    });
    expect(0).to.be.equal(Object.entries(beforesmcNFT1.value.nftItems).length);

    await smcRootTokenContract.call({
      functionName: "grant",
      input: {
        nftHash: nftHash,
        addr: nftAddress1,
      },
    });

    const after = await smcRootTokenContract.run({
      functionName: "nftItems",
    });
    expect(0).to.be.equal(Object.entries(after.value.nftItems).length);

    const aftersmcNFT1 = await smcNFT1.run({
      functionName: "nftItems",
    });
    expect(1).to.be.equal(Object.entries(aftersmcNFT1.value.nftItems).length);
  });

  it("transfer from NFT1 to NFT2", async () => {
    const beforeSmcNFT1 = await smcNFT1.run({
      functionName: "nftItems",
    });
    expect(1).to.be.equal(Object.entries(beforeSmcNFT1.value.nftItems).length);
    const beforeSmcNFT2 = await smcNFT2.run({
      functionName: "nftItems",
    });
    expect(0).to.be.equal(Object.entries(beforeSmcNFT2.value.nftItems).length);
    await smcNFT1.call({
      functionName: "transfer",
      input: {
        nftHash: nftHash,
        dest: nftAddress2,
      },
    });
    const afterSmcNFT1 = await smcNFT1.run({
      functionName: "nftItems",
    });
    expect(0).to.be.equal(Object.entries(afterSmcNFT1.value.nftItems).length);
    const afterSmcNFT2 = await smcNFT2.run({
      functionName: "nftItems",
    });
    expect(1).to.be.equal(Object.entries(afterSmcNFT2.value.nftItems).length);
  });

  it("create NftBuySell and approve nft to sell and disapprove", async () => {
    smcBuySell = new TonContract({
      client,
      name: "BuySell",
      tonPackage: buySellPackage,
      keys: keys1,
    });
    await smcBuySell.calcAddress();

    await smcNFT2.call({
      functionName: "approveToSell",
      input: {
        nftHash: nftHash,
        seller: smcBuySell.address,
      },
    });
    const forSale = await smcNFT2.run({
      functionName: "getForSale",
    });
    expect(smcBuySell.address).to.be.equal(forSale.value.forSale.seller);

    await smcNFT2.call({
      functionName: "disApprove",
    });
    const afterDisapprove = await smcNFT2.run({
      functionName: "getForSale",
    });
    expect(
      "0:0000000000000000000000000000000000000000000000000000000000000000"
    ).to.be.equal(afterDisapprove.value.forSale.seller);
  });

  it("deploy NftBuySell, approve nft2", async () => {
    await smcGiver.call({
      functionName: "sendGrams",
      input: {
        dest: smcBuySell.address,
        amount: 5000000000,
      },
    });

    await smcBuySell.deploy({
      input: {
        nftAddress: nftAddress2,
        ownerWalletAddress: smcSMW2.address,
        marketplaceWalletAddress: smcSMW3.address,
        price: 1000000000,
        nftHash: nftHash,
        commission: 5000000,
      },
    });

    await smcNFT2.call({
      functionName: "approveToSell",
      input: {
        nftHash: nftHash,
        seller: smcBuySell.address,
      },
    });

    const afterDisapprove = await smcNFT2.run({
      functionName: "getForSale",
    });
    expect(smcBuySell.address).to.be.equal(
      afterDisapprove.value.forSale.seller
    );
  });

  it("buy nft from 2 to 1", async () => {
    const beforeSell1 = await smcNFT1.run({
      functionName: "nftItems",
    });
    expect(0).to.be.equal(Object.entries(beforeSell1.value.nftItems).length);

    const beforeSell2 = await smcNFT2.run({
      functionName: "nftItems",
    });
    expect(1).to.be.equal(Object.entries(beforeSell2.value.nftItems).length);

    const { body: body } = await client.abi.encode_message_body({
      abi: {
        type: "Contract",
        value: smcBuySell.tonPackage.abi,
      },
      signer: { type: "None" },
      is_internal: true,
      call_set: {
        function_name: "changeOwner",
        input: {
          dest: smcNFT1.address,
        },
      },
    });
    await smcSMW1.call({
      functionName: "sendTransaction",
      input: {
        dest: smcBuySell.address,
        value: 3_500_000_000,
        flags: 2,
        bounce: true,
        payload: body,
      },
    });

    const afterSell1 = await smcNFT1.run({
      functionName: "nftItems",
    });

    expect(1).to.be.equal(Object.entries(afterSell1.value.nftItems).length);

    const afterSell2 = await smcNFT2.run({
      functionName: "nftItems",
    });
    expect(0).to.be.equal(Object.entries(afterSell2.value.nftItems).length);
  });
});
