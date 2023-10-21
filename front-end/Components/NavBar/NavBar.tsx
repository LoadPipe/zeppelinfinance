"use client"
import Link from "next/link";
import Image from "next/image";
import PrimaryButton from "../PrimaryButton/PrimaryButton";
import SecondaryButton from "../SecondaryButton/SecondaryButton";
import Logo from "@/images/Logo.svg";
import RowLayout from "../RowLayout/RowLayout";
import Login from "../Login/Login";

const Navbar: React.FC = () => {

  return (
    <nav className=" w-full bg-white h-[84px] py-3">
      <RowLayout>
        <div className=" flex justify-between items-center px-10">
          <div>
            <Image
              src={Logo}
              width={41}
              height={41}
              alt="Logo Zeppelin"
            ></Image>
          </div>
          <div className="flex gap-x-10">
            <div className="flex gap-x-5 items-center text-[#15110E] text-base font-bold">
              <Link className="hover:text-orange-700" href="/about">
                About
              </Link>
              <Link className="hover:text-orange-700" href="/launchpad">
                Launchpad
              </Link>
              <Link className="hover:text-orange-700" href="/marketplace">
                Marketplace
              </Link>
            </div>
            <div className="flex gap-x-5">
              <Link href="/wallet"><PrimaryButton>My Account</PrimaryButton></Link>
              <Link href="/create-collection"><SecondaryButton>Create</SecondaryButton></Link>
              <Login />
            </div>
          </div>
        </div>
      </RowLayout>
    </nav>
  );
};

export default Navbar;
