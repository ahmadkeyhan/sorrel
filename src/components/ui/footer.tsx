import Link from "next/link"
import {Laptop, MapPin} from 'lucide-react'
import Image from "next/image";

const navItems = [
    { name: "منو", href: "/menu", icon: 'Quote' },
    { name: "مارکت", href: "/market", icon: 'HeartHandshake' },
  ];

export default function Footer() {
    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || ""
    
    return (
        <div className="w-full grid gap-4 sm:grid-cols-2 bg-teal-700 p-4 pt-6">
            <div className="flex flex-col gap-2 items-center text-white">
                <div className="relative w-32 mb-2">
                    <Image
                        src={"/amberLogo.png"}
                        alt="لوگوی سورل"
                        width={1044}
                        height={1352}
                    />
                </div>
                {navItems.map((item) => {
                    return (
                        <Link href={item.href} key={item.name} className="text-amber-50 transition-colors duration-300  pb-2 px-2">
                            <h3 className="text-sm">
                                {item.name}
                            </h3>
                        </Link>
                    )
                })}
                <Link href="https://www.instagram.com/sorrel_cafe" target="_blank" rel="noopener noreferrer">
                    <h3 className="text-sm text-amber-50">اینستاگرام</h3>
                </Link>
            </div>
            <div className="flex flex-col gap-2">
                <div className="overflow-hidden h-full max-w-full rounded-[0.125rem] border-2 border-amber-50 p-1">
                    <div id="canvas-for-googlemap" className="h-full w-full max-w-full">
                        <iframe className="h-full w-full border-0"  src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d555.3442378675844!2d46.365521288936236!3d38.05870235020895!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x401a1b28c783eb35%3A0x1c5f1726db69a5bf!2z2qnYp9mB2Ycg2LPZiNix2YQ!5e0!3m2!1sen!2sus!4v1758392850914!5m2!1sen!2sus`}  allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                    </div>
                </div>
                <p className="text-amber-50 text-center text-base inline">
                    <span><MapPin className="w-4 h-4 inline ml-1 text-amber-500" /></span>
                    ولیعصر، پایین‌تر از فلکه رودکی، نرسیده به چهـــارراه سعدى، روبروی ساختمان مهندسان
                </p>
            </div>
            <div className="flex sm:col-span-2 justify-center items-center gap-2 text-base text-amber-100 py-2">
                <Laptop className="w-4 h-4" />
                <p className="text-lg">طراحی و توسعه توسط <Link href="https://www.instagram.com/key.hansa" target="_blank" rel="noopener noreferrer"><span className="border-b font-bold">کیهانزا</span></Link></p>
            </div>
        </div>
    )
}