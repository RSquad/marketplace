pragma ton-solidity >= 0.39.0;
pragma AbiHeader expire;
pragma AbiHeader pubkey;


import 'NFT.sol';


contract BuySell {

    address _owner_wallet_address;
    address public _nft_address;
    address _marketplace_wallet_address;
    uint128 public _price;
    uint256 public _nftHash;
    uint128 _commission;
    bool public _closed;

    constructor(
        address nftAddress,
        address ownerWalletAddress,
        address marketplaceWalletAddress,
        uint128 price,
        uint256 nftHash,
        uint128 commission
    ) public {
        tvm.accept();
        _nft_address = nftAddress;
        _owner_wallet_address = ownerWalletAddress;
        _marketplace_wallet_address = marketplaceWalletAddress;
        _price = price;
        _nftHash = nftHash;
        _commission = commission;
        _closed = false;
    }

    function changeOwner(address dest) public {
        require(_closed == false, 101);
        require(msg.value >= _price + _commission + 50000000, 102);
        tvm.accept();

        NFT(_nft_address).sell(dest, _nftHash);

        _owner_wallet_address.transfer({value: address(this).balance - _commission - 50000000, bounce: true});
        _marketplace_wallet_address.transfer({value: _commission, bounce: true});
        _closed = true;
    }

    function revoke() public {
        //TODO check owner
        require(msg.sender == _owner_wallet_address, 100);

        NFT(_nft_address).disApprove();
        _closed = true;
        _owner_wallet_address.transfer({value: address(this).balance - 50000000, bounce: true});
    }
}