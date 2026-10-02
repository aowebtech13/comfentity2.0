import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

// import images
import img1 from "@/assets/images/all-img/big-shap1.png";
import img2 from "@/assets/images/all-img/big-shap2.png";
import img3 from "@/assets/images/all-img/big-shap3.png";
import img4 from "@/assets/images/all-img/big-shap4.png";

const tables = [
  {
    title: "Starter",
    price_Yearly: "$10",
    button: "Subscribe Now",
    bg: "bg-warning-500/15 bg-warning-500/30 ",
    img: img1,
  },
  {
    title: "Growth",
    price_Yearly: "$50",
    button: "Subscribe Now",
    bg: "bg-info-500/15 bg-info-500/30 ",
    ribon: "Most popular",
    img: img2,
  },
  {
    title: "summit",
    price_Yearly: "$100",
    button: "Subscribe Now",
    bg: "bg-success-500/15 bg-success-500/30 ",
    img: img3,
  },
  {
    title: "Apex",
    price_Yearly: "$200",
    button: "Subscribe Now",
    bg: "bg-primary-500/15 bg-primary-500/30 ",
    img: img4,
  },
];

const PricingPage = () => {
  const [check, setCheck] = useState(true);
  const toggle = () => {
    setCheck(!check);
  };

  return (
    <div>
      <div className="space-y-5">
        <Card>
          <div className="flex justify-between mb-6">
            <h4 className="text-slate-900 dark:text-slate-300 text-xl font-medium">Nexora Packages</h4>
          
          </div>
          <div className="grid xl:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-5">
            {tables.map((item, i) => (
              <div
                className={` ${item.bg}
          price-table  rounded-[6px] p-6 text-slate-900 dark:text-white relative overflow-hidden z-1
          `}
                key={i}
              >
                <div className="overlay absolute right-0 top-0 w-full h-full z-[-1]">
                  <img src={item.img} alt="" className="ml-auto block" />
                </div>
                {item.ribon && (
                  <div className="text-sm font-medium bg-slate-900 dark:bg-slate-900 text-white py-2 text-center absolute ltr:-right-[43px] rtl:-left-[43px] top-6 px-10 transform ltr:rotate-[45deg] rtl:-rotate-45">
                    {item.ribon}
                  </div>
                )}
                <header className="mb-6">
                  <h4 className="text-xl mb-5">{item.title}</h4>
                  <div className="space-x-4 relative flex items-center mb-5 rtl:space-x-reverse">
                    
                      <span className="text-[32px] leading-10 font-medium">
                        {item.price_Yearly}{" "}
                      </span>
                  
                     
                  

                    <span className="text-xs text-warning-500 font-medium px-3 py-1 rounded-full inline-block bg-white uppercase h-auto">
                      free mentorship
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-300 text-sm">
                    1-time deposit
                  </p>
                </header>
                <div className="price-body space-y-8">
                  <p className="text-sm leading-5 text-slate-600 dark:text-slate-300">
                  designed for professional day traders firms who want to automate their financial market activities
                  </p>
                  <div>
                    <Button
                      text={item.button}
                      className="btn-outline-dark dark:border-slate-400! w-full"
                      href="https://trade.exnova.com/pwa?aff=792336&aff_model=revenue&afftrack="
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
     
      </div>
    </div>
  );
};

export default PricingPage;
