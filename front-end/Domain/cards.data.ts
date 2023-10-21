import { CardProps, NftDataProps, FooterCardProps } from "../Components/Card/Card";

import imgFlask from "@/images/flask.png"
import imgCloths from "@/images/cloth.png"
import imgShelfMat from "@/images/shelfmat.png"
import imgPourer from "@/images/pourer.png"
import imgShotGlass from "@/images/shotglass.png"

export const nftData: NftDataProps[] = [
    {
        address: "0x3a4253caDD26695B2e16d764713ded64c7db6082", 
        price: 100000, 
        productName: "Men's Drinking Flask Gift Set",
        brandName: "Excalibur Brothers",
        imageUrl: "noodle magic",
        numberMinted: 3, 
        numberForSale: 3,
        policies: [
            {
                type: "FinancingReward", 
                percentageBps: 120,
                inventoryLimit: 0, 
                shared: false, 
                fillOrKill: false
            },
            {
                type: "AffiliateReward",
                percentageBps: 120
            }
        ], 
        instances: [
            {
                affiliateId: "0xe6c95a1445981f4157",
                tokenId: 1
            },
            {
                affiliateId: "0x45fe4ab6ad329d38d1",
                tokenId: 2
            },
            {
                affiliateId: "0xa672f57ef835ce7899",
                tokenId: 3
            }
        ],

        alt: "string", 
        likes: 12
    }
]; 

interface DataCard extends CardProps, FooterCardProps{

}

export const cardsData:DataCard[] = [
    {
        image:imgShotGlass,
        title:"Shot Glass Set - 6 glasses",
        flow: "1.3",
        alt: "string",
        likes:4,
    },{
        image:imgCloths,
        title:"Polishing Cloths 10 pack box",
        flow: "4.7",
        alt: "string",
        likes:3,
    },{
        image: imgShelfMat,
        title:"Interlocking Shelf Mat",
        flow: "4.0",
        alt: "string",
        likes:0,
    },{
        image:imgPourer,
        title:"13-pack Plastic Pourers",
        flow: "88",
        alt: "string",
        likes:29,
    }
];