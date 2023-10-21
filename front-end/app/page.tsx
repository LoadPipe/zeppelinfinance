"use client";
import RowLayout from "@/Components/RowLayout/RowLayout";
import "./landing.css";
import Image from "next/image";
import electro1 from "@/images/electro1.png";
import electro2 from "@/images/electro2.png";
import electro3 from "@/images/electro3.png";
import electro4 from "@/images/electro4.png";
import SecondaryButton from "@/Components/SecondaryButton/SecondaryButton";
import PrimaryButton from "@/Components/PrimaryButton/PrimaryButton";
import Card from "@/Components/Card/Card";
import { cardsData } from "@/Domain/cards.data";
import ButtonLink from "@/Components/ButtonLink/ButtonLink";
import twitterIcon from "@/images/twitter.svg";
import facebookIcon from "@/images/facebook.svg";
import slackIcon from "@/images/slackIcon.svg";
import linkedinIcon from "@/images/Linkedin.svg";
import pinterestIcon from "@/images/Pinterest.svg";
import Subtitle from "@/Components/Subtitle/Subtitle";
import Footer from "@/Components/Footer/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center">
      <div className="bg-header-landing">
        <RowLayout fit>
          <div className="flex">
            <div>
              <div className="max-w-[118.68px] h-[223.66px] ">
                <Image src={electro1} alt="logo product" />
              </div>
              <div className="max-w-[124px] h-[124px]">
                <Image
                  className="rounded-full"
                  src={electro2}
                  alt="logo product"
                />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div>
                <p className="text-[54px] font-bold">
                  Unlock the Full Potential of Web3 Ecommerce
                </p>
                <span className="text-black text-2xl font-normal leading-loose">
                  Empower Your Brand and Community in a Decentralized Ecosystem
                </span>
              </div>
              <div className="flex gap-[24px]">
                <Link href="/launchpad"><PrimaryButton> Browse Launchpad </PrimaryButton></Link>
                <Link href="/create-collection"><SecondaryButton> Create Collection</SecondaryButton></Link>
              </div>
            </div>
            <div>
              <div className="max-w-[135.93px] h-[135.93px] bg-white rounded-full flex items-center">
                <Image src={electro3} alt="logo product" />
              </div>
              <div className="max-w-[188.90px] h-[188.90px]">
                <Image src={electro4} alt="logo product" />
              </div>
            </div>
          </div>
        </RowLayout>
      </div>
      <RowLayout fit>
        <div className="flex flex-col justify-center">
          <div>
            <p className="ext-black text-[28px] font-extrabold">
              Selected notable Brands
            </p>
          </div>

          <div>
            <div className="flex justify-between w-full gap-1.5 my-20">
              {cardsData.map(
                (
                  { alt, title, flow: description, image, likes: like },
                  index
                ) => (
                  <Card
                    key={index}
                    flow={description}
                    title={title}
                    alt={alt}
                    image={image}
                    footer={"imagenes"}
                  />
                )
              )}
            </div>
          </div>
        </div>
      </RowLayout>
      <div className="bg-gray-100 bg-opacity-50 w-full">
        <RowLayout fit>
          <div>
            <div className="flex py-[66px]">
              <div className="flex1">
                <div>
                  <div className="flex flex-col">
                    <div>
                      <span className="text-black text-base font-bold">
                        Subscribe to updates
                      </span>
                    </div>
                    <div className="max-w-[301px]">
                      <input
                        className="rounded-3xl border border-neutral-300 border-opacity-60  p-[12px] w-full"
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter your e-mail"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-black text-base font-bold">
                      Follow us
                    </span>
                    <div className="flex">
                      <ButtonLink href={""} src={facebookIcon} />
                      <ButtonLink href={""} src={slackIcon} />
                      <ButtonLink href={""} src={twitterIcon} />
                      <ButtonLink href={""} src={pinterestIcon} />
                      <ButtonLink href={""} src={linkedinIcon} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="font-bold flex-1">
                <p className="text-base">Marketplace</p>
                <ButtonLink href="">Explore</ButtonLink>
                <ButtonLink href="" >Help Center</ButtonLink>
                <ButtonLink href="" >Become a Partner</ButtonLink>
                <ButtonLink href="" >About Us</ButtonLink>
                <ButtonLink href="" >Platform Status</ButtonLink> 
              </div>
              <div className="font-bold flex-1">
                <p className="text-base">Community</p>
                <ButtonLink href="" >Profile</ButtonLink>
                <ButtonLink href="" >Favorites</ButtonLink>
                <ButtonLink href="" >Watchlist</ButtonLink>
                <ButtonLink href="" >Collections</ButtonLink>
                <ButtonLink href="" >Rankings</ButtonLink>
                <ButtonLink href="" >Activity</ButtonLink>
              </div>
              <div className="max-w-[365px] flex-1">
                <Subtitle
                  subtitle={"Region"}
                  text={
                    "The world’s first marketplace for collectibles and non-fungible tokens NFTs where anything is possible and all are welcome"
                  }
                />
              </div>
            </div>
          </div>
        </RowLayout>
        <div>
          <Footer />
        </div>
      </div>
    </main>
  );
}
