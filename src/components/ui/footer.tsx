import Link from "next/link"
import {Laptop, MapPin} from 'lucide-react'
import Image from "next/image";

const navItems = [
    { name: "درباره‌ی ما", href: "/about", icon: 'Quote' },
    { name: "همکاری", href: "/cooperation", icon: 'HeartHandshake' },
    { name: "مسئولیت اجتماعی", href: "/responsibility", icon: 'HandHeart' },
  ];

export default function Footer() {
    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || ""
    
    return (
        <div className="w-full grid gap-4 sm:grid-cols-2 bg-qqteal p-4 pt-6">
            <div className="flex flex-col gap-2 items-center text-white">
                <div className="relative w-20 mb-2">
                    <Image
                        src={"/qoshaqafWhite.png"}
                        alt="لوگوی کافه قوشاقاف"
                        width={774}
                        height={869}
                    />
                </div>
                {navItems.map((item) => {
                    return (
                        <Link href={item.href} key={item.name} className="hover:text-qqcream transition-colors duration-300  pb-2 px-2">
                            <h3 className="text-sm text-amber-100">
                                {item.name}
                            </h3>
                        </Link>
                    )
                })}
                <Link href="https://www.instagram.com/qq_qoshaqaf?igsh=ZDF4ZjEzcXdjOHA2" target="_blank" rel="noopener noreferrer">
                    <h3 className="text-sm text-amber-100">اینستاگرام</h3>
                </Link>
            </div>
            <div className="flex flex-col gap-2">
                <div className="overflow-hidden h-full max-w-full rounded-md">
                    <div id="canvas-for-googlemap" className="h-full w-full max-w-full">
                        {/* <iframe className="h-full w-full border-0" 
                            src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=Cafe+QQ+/قوشاقاف&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8`}>
                        </iframe> */}
                        <iframe className="h-full w-full border-0"  src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3141.265844745149!2d46.330100099999996!3d38.0641895!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x401a1b00283cc703%3A0xfc17c882bebbbb11!2zQ2FmZSBRUSAv2YLZiNi02KfZgtin2YE!5e0!3m2!1ssv!2s!4v1744228673757!5m2!1ssv!2s`}  allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                    </div>
                </div>
                <p className="text-white text-base inline">
                    <span><MapPin className="w-4 h-4 inline ml-1" /></span>
                    تبریز/ فلکه دانشگاه/ روبروی درب اصلی دانشگاه تبریز/ پاساژ جواهر
                </p>
            </div>
            <div className="flex sm:col-span-2 justify-center items-center gap-2 text-base text-amber-100 py-2">
                <Laptop className="w-4 h-4" />
                <p className="text-lg">طراحی و توسعه توسط <Link href="https://www.instagram.com/key.hansa" target="_blank" rel="noopener noreferrer"><span className="border-b font-bold">کیهانزا</span></Link></p>
            </div>
        </div>
    )
}