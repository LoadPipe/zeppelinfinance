/*
sepolia
matic_mumbai
scroll_sepolia
bsc_testnet
optimism_sepolia
zkevm_testnet 
*/

export const addresses: any = {
    NETWORK: "zkevm_testnet",
    ctor_args: "000000000000000000000000d1714394e1B8aFC2F8e8cc088C8689909A83416c",

    zeroAddress: "0x0000000000000000000000000000000000000000",
    sepolia: {
        zeroAddress: "0x0000000000000000000000000000000000000000",
        securityManager: "0xe07675f0eF8de2B4f32b14FBfB602Ab2C04f091E",
        productNftFactory: "0x2074eCEE521D2f4307e7Df42a4591fCC2150d02D",
        productNftStore: '0x43d806BBE4a652345D164bED5785A80141e7069A',
        productNftIssuer: '0xe833107Aab1B3A12D2e2e02348B5536819013334',
        zeppelinOracle: '0x039616d3cf0E10CD95e91d2852F7bA811c08730e',
        affiliatePayout: '0x2026d3850515e636E0Eb6C818d892198Fb96bbDF',
        refundPolicy: '0x7823261F4b05D60dF48a2341Eec24a41c2c50866',
        affiliatePolicy: '0x6CB849f67A091f44A851f5c7DB37899099712473',
        financingPolicy: '0xd23135585a229c5809FEA64F414e24C25bDBB428',
        policyFactory: '0xBC67c5D89906eE0E0C4A9F4926Ca26690bD4F804'

    },
    scroll_sepolia: {
        zeroAddress: "0x0000000000000000000000000000000000000000",
        securityManager: "0xd1714394e1B8aFC2F8e8cc088C8689909A83416c",      //verified
        productNftFactory: "0x1c8Bb31cda73B2A44bdCf1fFE8E56a62067f6C8c",    //verified
        productNftStore: '0xD6DF02147ADc18d37C571A9490D9e26aDBccA847',      //verified
        productNftIssuer: '0xf487017Dfd5F1a74dD07e1c93AB3782b3701508d',     //verified
        zeppelinOracle: '0x8DC4b788f987F45599C3FEe7998746c8c9bF3815',       //verified
        affiliatePayout: '0x69389553b45790964797af408b41155A3f843Ea1',      //verified      
        refundPolicy: '0xf26031b4dB64895e800E25D23421bc36F3A4e8a0',
        affiliatePolicy: '0x90816AE1a6f618d5Deb4f9E00fC9807126FfBdc5',
        financingPolicy: '0x2061884A972ac5c6262e1b3A51DB88220088Bd30',
        policyFactory: '0x4152cadE0669F5Cf3965760274CF5003Fa0463b9'
    },
    zkevm_testnet: {
        zeroAddress: "0x0000000000000000000000000000000000000000",
        securityManager: "0x0e36956c9be3B09A4a22DFb58C726bBc9F8b9F84",
        productNftFactory: "0x129086dCB12a4D03944084330c84941F17Abb08F",
        productNftStore: '0x72Ea52E44624aFe3FBc4A07837d73d9C21374598',
        productNftIssuer: '0x70E37D8627b91273F0dD0282aA272442811Ed468',
        zeppelinOracle: '0x9715576a50056E83fbf16845A670BdfF739f364A',
        affiliatePayout: '0x5C8CBD4DB05e82E72c4ac0624Bac126ADB88A8a2',
        refundPolicy: '0xb196a361B3d99EF9d808ff7260ead4981ab3c33e',
        affiliatePolicy: '0xc9a56c48b9f85a5D7A6752bc753bE3E5f1FCCcB7',
        financingPolicy: '0x8DC4b788f987F45599C3FEe7998746c8c9bF3815',
        policyFactory: '0x69389553b45790964797af408b41155A3f843Ea1'
    },
    zkevm_testnet_old: {
        zeroAddress: "0x0000000000000000000000000000000000000000",
        securityManager: "0x4B36e6130b4931DCc5A64c4bca366790aAA068d1",
        productNftFactory: "0xA417775D7bCC5eA03D8F1223D25C3B47CB22C2bE",
        productNftStore: '0xd7e19b955321dcaE4070cF9240c2aD33C7439457',
        productNftIssuer: '0xADF789E61Bf38c463e4bA5B2B6E9C1Af6659e11b',
        zeppelinOracle: '0x412d0493c7fF6FFba527f2A8bcc21Fa419ea809C',
        affiliatePayout: '0xb799Df50f2d81cAEd17b130357c3796012D4cFAC',
        refundPolicy: '0x58d3E4e41dbc7Dde9783595B0D690dc53EDAc1A7',
        affiliatePolicy: '0xCA5B040866eAf7aae577A05C664d702Df9a3C76d',
        financingPolicy: '0x3e6cecF46Ec03c570588454A634fdED70eD9b862',
        policyFactory: '0x5cB603DB37d80e162a355f8085ED1885769ec211'
    },
    optimism_goerli: {
        zeroAddress: "0x0000000000000000000000000000000000000000",
        securityManager: "",
        nftFactory: "",
        nftStore: '',
        nftIssuer: '',
        zeppelin: '',
        affiliatePayout: '',
        refundPolicy: '',
        financingPolicy: '',
        affiliatePolicy: '',
        policyFactory: ''
    },
    matic_mumbai: {
        zeroAddress: '0x0000000000000000000000000000000000000000',
        securityManager: '0xe21656269BB86877c6F90B287b7bb26EF9127640',
        productNftFactory: '0x30EE26f15D25ceF2dfAb4e6381b4077bcE080771',
        productNftStore: '0xADF789E61Bf38c463e4bA5B2B6E9C1Af6659e11b',
        productNftIssuer: '0x39b467042099881B510b35911e7d8FEd9C8F2Be9',
        zeppelinOracle: '0x4BE5Be7f9dF583225D836601fE00eDA090A546cf',
        affiliatePayout: '0x1a8a1E3DC468329fd47DEe2B778585FE20De3429',
        refundPolicy: '0x6C447E11F03F09dF89076A1542Fe807C7f0870Ba',
        financingPolicy: '0x6Da37Be6E3dC0A88879aF7513F7E00B7E70c7f4C',
        affiliatePolicy: '0x252d438e056fe4Da436c92389595B97b1C912B27',
        policyFactory: '0xc9a56c48b9f85a5D7A6752bc753bE3E5f1FCCcB7'
    }
}   
