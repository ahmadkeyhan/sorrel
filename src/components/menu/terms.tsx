"use client";

import { Info } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Terms() {
  const [termsOpen, setTermsOpen] = useState(false);
  const toggleTerms = () => {
    setTermsOpen(!termsOpen);
  };
  return (
    <div className="flex flex-col">
      <div className="p-2 flex items-center gap-1 bg-amber-100 w-fit rounded-lg -mb-3 z-10 cursor-pointer font-semibold" onClick={toggleTerms}>
        <p className="text-qqteal underline underline-offset-2">
          شرایط استفاده از قوشاقاف
        </p>
        <Info className="h-4 w-4 text-qqorange" />
      </div>

        <div className={`text-qqteal bg-amber-100 p-4 text-sm rounded-lg rounded-tr-none space-y-4 ${termsOpen ? "opacity-100" : "opacity-0"} transition-all duration-500`}>
          <p>
            ۱.کافه قوشاقاف یک فضای کار اشتراکی به معنای مکانی که میز اجاره بکنید
            نیست. و حداقل فعلا شرایط خاصی جز یک کافه نشینی ساده و سفارش آیتم های
            منو ندارد. ما از حضور شما و معاشرت لذت میبریم و تا زمانی که ظرفیت
            کافه پر نباشد هیچ محدودیتی برای نشستن نداریم. اجتماعی بودن میز ها و
            تعداد بالای صندلی باعث میشود اکثر اوقات برای دوستان جدید جای خالی
            داشته باشیم اما برای خدمات رسانی بهتر در ساعاتی که ظرفیت کافه پر
            می‌شود سفارش هایی که بالای ۳ ساعت از زمان ثبت آن ها میگذرد یکبار
            نیاز به تمدید دارند.
          </p>
          <p>
            ۲.شما می‌توانید بدون سفارش دادن از محیط و میزهای کافه استفاده بکنید که مبلغ آن به صورت هر ساعت ۹۰ هزار تومان محاسبه می‌گردد.
          </p>
          <p>
            ۳.هزینه سرو و صرف آیتم های خارج از منو کافه به صورت جدا محاسبه می‌گردد.
          </p>
          <p>
            برای اطلاعات تکمیلی درباره کافه به قسمت <span className="text-qqcream underline">
                <Link href="/about">
                درباره ما
                </Link>
                </span> مراجعه فرمایید.
          </p>
        </div>
    </div>
  );
}
