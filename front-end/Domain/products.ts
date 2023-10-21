import imgCollection1 from "@/images/imgCollection1.png"
import imgCollection2 from "@/images/imgCollection2.png"
import imgCollection3 from "@/images/imgCollection3.png"
import imgCollection4 from "@/images/imgCollection4.png"
import{productsProps} from "@/Domain/productsProps"


export const products:productsProps[] =[
    {
        title: "A Weird Thing",
        price: 0.03,
        royalty: 15,
        affiliate: 8,
        bonus: "Yes",
        payout: 3,
        amount: "25/50",
        image: imgCollection2,
        alt: "product Logo",
        index: 1,
        collection: "Collectibles"
    },
    {
        title: "Another Thing",
        price: 0.03,
        royalty: 15,
        affiliate: 8,
        bonus: "Yes",
        payout: 3,
        amount: "25/50",
        image: imgCollection3,
        alt: "product Logo",
        index: 1,
        collection: "Collectibles"
    },
    {
        title: "Another Thing",
        price: 0.03,
        royalty: 15,
        affiliate: 8,
        bonus: "Yes",
        payout: 3,
        amount: "25/50",
        image: imgCollection4,
        alt: "product Logo",
        index: 1,
        collection: "Collectibles"
    }
  ];