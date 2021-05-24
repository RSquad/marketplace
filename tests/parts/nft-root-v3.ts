import { utf8ToHex } from "../utils/convert";
import { TonClient } from "@tonclient/core";
import TonContract from "../ton-contract";
import { trimlog } from "../utils/common";
import RootTokenContractNF from "../../ton-packages/NftRoot.package";
import NFT from "../../ton-packages/NFT.package";

export default async (client: TonClient, smcNSEGiver: TonContract) => {
  const keysRoot = await client.crypto.generate_random_sign_keys();
  let smcRTW = new TonContract({
    client,
    name: "RootTokenContract",
    tonPackage: RootTokenContractNF,
    keys: keysRoot,
  });
  await smcRTW.calcAddress({
    initialData: {
      _collection_id: 1,
    },
  });

  trimlog(`NftRoot address: ${smcRTW.address},
      NftRoot public: ${smcRTW.keys.public},
      NftRoot secret: ${smcRTW.keys.secret}`);

  await smcNSEGiver.call({
    functionName: "sendGrams",
    input: {
      dest: smcRTW.address,
      amount: 100_000_000_000,
    },
  });

  await smcRTW.deploy({
    initialData: {
      _collection_id: 1,
    },
    input: {
      nft: NFT.image,
      icon: utf8ToHex("picture"),
      name: utf8ToHex("myToken"),
    },
  });

  return smcRTW;
};
