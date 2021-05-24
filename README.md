# TIP-31 tokens with by RSquad

A smart contract system for the marketplace that implements the TIP-31 standard. From a marketplace perspective, NftRoot equals Collection, NFT is a wallet for NftItems (equals Nft).

The user deploys N collections with one pair of keys, and a constant is added to the initialData to get different addresses.

An NFT contract can be deployed either by the owner using a key pair, or by any other wallet owner who will call the internal message with a sufficient number of crystals.

The NFT contract is initially empty as well as the NftRoot. The owner of the NftRoot calls the mint() method to create an NftItem. Later, he can transfer the NftItem to another owner of the NFT by calling the grant() method.
Tokens can be exchanged between wallets, but within the same parent NftRott.

To sell, you need to do a sequence of actions with smart contracts. First, you need to deploy a BuySell contract. The seller then approves his address as trusted for the sale by calling the approveToSell(uint nftHash, address seller) method and passing it the NftItem id and the BuySell contract address. The sale is carried out upon receipt of sufficient funds from another NFT owner within the same NftRoot, and indicating this address. A sale can be canceled by calling the revoke() method on the BuySell contract.
