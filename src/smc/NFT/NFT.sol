pragma ton-solidity >=0.43.0;
pragma AbiHeader expire;
pragma AbiHeader time;

import "NftAcceptable.sol";
import "NftTranferable.sol";

struct ForSale {
    uint256 nftHash;
    address seller;
}

contract NFT is NftAcceptable, NftTranferable {

    ForSale _forSale;

    modifier onlySellContract() {
        require(msg.sender == _forSale.seller, 106);
        tvm.accept();
        _;
    }

    constructor() public onlyRoot acceptMsg {
    }

    function approveToSell(uint256 nftHash, address seller) public onlyOwner nftExists(nftHash) acceptMsg {
        _forSale = ForSale(nftHash, seller);
    }

    function getForSale() public view acceptMsg returns (ForSale forSale) {
        return _forSale;
    }

    function getNftItem(uint256 nftHash) public view acceptMsg returns (NftItem) {
        return nftItems[nftHash];
    }

    function disApprove() public onlyOwner acceptMsg {
        _forSale = ForSale(0, address(0));
    }

    function sell(address dest, uint256 nftHash) public onlySellContract {
        NftItem item = nftItems[nftHash];
        delete nftItems[nftHash];
        _forSale = ForSale(0, address(0));

        NftTranferable(dest).internalTransfer{
            value: 1 ton,
            flag: 1,
            bounce: true
        }(item, tvm.pubkey());

    }
}