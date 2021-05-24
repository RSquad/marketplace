pragma ton-solidity >=0.43.0;

import "NftBase.sol";

abstract contract NftTranferable is NftBase {
    function transfer(uint256 nftHash, address dest) public onlyOwner nftExists(nftHash) acceptMsg {
        NftItem item = nftItems[nftHash];
        delete nftItems[nftHash];
        
        NftTranferable(dest).internalTransfer{
            value: 1 ton,
            flag: 1,
            bounce: true
        }(item, tvm.pubkey());
    }

    function internalTransfer(NftItem nft, uint256 senderPubKey) public {
        uint256 addr = tvm.hash(tvm.buildStateInit({code: tvm.code(), pubkey: senderPubKey}));
        require(msg.sender == address.makeAddrStd(0, addr), 110);

        _addItem(nft);
        msg.sender.transfer({value: 0, flag: 64, bounce: false});
    }

    function _addItem(NftItem nft) internal {
        TvmBuilder b;
        b.store(nft);
        nftItems[tvm.hash(b.toCell())] = nft;
    }
}