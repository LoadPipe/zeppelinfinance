import RowLayout from "../RowLayout/RowLayout";

const Footer: React.FC = () => {
  return (
    <div className="border-[2px] border-Zin-600">
      <RowLayout fit>
        <div className="text-black text-xs font-bold flex justify-between items-center py-[20px]">
          <div>
            <span>Privacy Policy</span>
            <span>License</span>
            <span>API</span>
            <span className="text-zinc-600 font-medium">
              © 2021 All rights reserved
            </span>
          </div>
          <div className="flex items-center">
            <span>English</span>
            <div className="border-[2px] border-Zin-600 w-[46px] h-[46px] rounded-[50%]"></div>
          </div>
        </div>
      </RowLayout>
    </div>
  );
};

export default Footer;
