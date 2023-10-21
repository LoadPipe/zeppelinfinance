import imgFlask from "@/images/flask.png"
import imgCloths from "@/images/cloth.png"
import imgShelfMat from "@/images/shelfmat.png"
import imgPourer from "@/images/pourer.png"
import{productsProps} from "@/Domain/productsProps"


export const products:productsProps[] =[
    {
        title: "Polishing Cloths",
        price: 0.03,
        royalty: 15,
        affiliate: 8,
        bonus: "Yes",
        payout: 3,
        amount: "25/50",
        image: imgCloths,
        alt: "product Logo",
        index: 1,
        collection: "Collectibles"
    },
    {
        title: "Interlocking Shelf Mat",
        price: 0.02,
        royalty: 1.4,
        affiliate: 2.4,
        bonus: "No",
        payout: 0,
        amount: "15/20",
        image: imgShelfMat,
        alt: "product Logo",
        index: 1,
        collection: "Collectibles"
    },
    {
        title: "13-pack Plastic Pourers",
        price: 0.021,
        royalty: 15,
        affiliate: 1,
        bonus: "Yes",
        payout: 1,
        amount: "15/15",
        image: imgPourer,
        alt: "product Logo",
        index: 1,
        collection: "Collectibles"
    }
  ];