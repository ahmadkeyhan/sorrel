"use client"

import { useEffect, useState } from "react";
import MenuCategories from "@/components/menu/menuCategories";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCategories } from "@/lib/data/categoryData";

interface Group {
    title: string
    name: string
    bgColor: string
    textColor: string
    subtextColor: string
    imageSrc: string
}

interface category {
  _id: string;
  name: string;
  group: string
  order: number;
}

interface groupedCategories {
  [group: string]: category[];
}

export default function Home() {
    const [group,setGroup] = useState<Group | null>(null);
    const [groupIndex,setGroupIndex] = useState(0);
    const [categories, setCategories] = useState<category[]>([])
    const [groupedCategories, setGroupedCategories] = useState<groupedCategories>({});
    const [loading,setLoading] = useState<boolean>(true)
    const groups = [
        {
            title: "بـــــــــــــــــــــــــارِ گــــَــــــــــــــــــــرم",
            name: "بار گرم",
            bgColor: "amber-50",
            textColor: "teal-700",
            subtextColor: "teal-600",
            imageSrc: "",
        },
        {
            title: "بــــــــــــــــــــــــارِ ســــَــــــــــــــــــــرد",
            name: "بار سرد",
            bgColor: "amber-50",
            textColor: "teal-700",
            subtextColor: "teal-600",
            imageSrc: "",
        },
        {
            title: "کِیـــــــــــــــــــک و دِســــِــــــــــــــــر",
            name: "کیک و دسر",
            bgColor: "amber-50",
            textColor: "teal-700",
            subtextColor: "teal-600",
            imageSrc: "",
        },
        {
            title: "غــــــــــــــــَــــــــــــــــــــــــــــــــــذاها",
            name: "غذاها",
            bgColor: "teal-700",
            textColor: "amber-50",
            subtextColor: "amber-50",
            imageSrc: "",
        },
        {
            title: "صُبـــــــحانـــــــــــــــــــــــــــــــِــــــــه ",
            name: "صبحانه",
            bgColor: "amber-50",
            textColor: "teal-700",
            subtextColor: "teal-600",
            imageSrc: "",
        },
        {
            title: "قـــــِـــــــــــــــــــــــلیــــــــــــــــــــــان",
            name: "قلیان",
            bgColor: "amber-50",
            textColor: "teal-700",
            subtextColor: "teal-600",
            imageSrc: "",
        },
    ]

    useEffect(() => {
        loadCategories()
    }, [])
    
    useEffect(() => {
    // Group items by category
        const grouped: groupedCategories = {};

        categories.forEach((category) => {
            
                
            if (!grouped[category.group]) {
                grouped[category.group] = [];
            }
            // Only add if not already in this category group
            // if (
            //   !grouped[category.group].find(
            //     (existingCategory) => existingCategory.id === category.id
            //   )
            // ) {
                grouped[category.group].push(category);
            // }
        });

        // Sort items within each category by order
        Object.keys(grouped).forEach((group) => {
            grouped[group].sort((a, b) => (a.order || 0) - (b.order || 0));
        });

        setGroupedCategories(grouped);
        console.log(categories,groupedCategories)
    }, [categories]);

    const loadCategories = async () => {
        setLoading(true)
        const data = await getCategories()
        data.sort((a: category, b: category) => (a.order || 0) - (b.order || 0))
        setCategories(data)
        setLoading(false)
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-amber-50">
                <div className="container p-2 mx-auto max-w-3xl">
                    <section className="space-y-2">
                        {groups.map((group) => {
                            return (
                                <div key={group.title} className={`flex animate-pulse justify-center items-center w-full border-2 border-teal-700 rounded-[0.125rem] aspect-[4/1] bg-${group.bgColor} text-${group.textColor}`}>
                                    <h2 className="font-black text-xl">{group.title}</h2>
                                </div>
                            )
                        })}
                    </section>
                </div>
            </main>
        )
    }

    else if (!group) {
        return (
            <main className="min-h-screen bg-amber-50">
                <div className="container p-2 mx-auto max-w-3xl">
                    <section className="space-y-2">
                        {groups.map((group, index) => {
                            return (
                                <div key={group.title} 
                                    onClick={() => {
                                        setGroup(group)
                                        setGroupIndex(index)
                                        window.scrollTo({ top: 0, behavior: 'smooth' })
                                    }} 
                                    className={`flex justify-center items-center w-full border-2 border-teal-700 rounded-[0.125rem] aspect-[4/1] bg-${group.bgColor} text-${group.textColor}`}
                                >
                                    <h2 className="font-black text-xl">{group.title}</h2>
                                </div>
                            )
                        })}
                    </section>
                </div>
            </main>
        );
    } else {
        return (
           <main className={`min-h-screen bg-${group? group.bgColor : "amber-50"}`}>
                <div className="container p-2 mx-auto max-w-3xl">
                    <section className="space-y-2 relative">
                        <div className={`flex justify-center sticky top-16 z-10 items-center gap-4 w-full border-2 border-${group.textColor} rounded-[0.125rem] aspect-[4/1] bg-${group.bgColor} text-${group.textColor}`}>
                            <Button variant="outline" size="icon"     
                                onClick={() => {
                                    setGroup(null)
                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                }}  
                                className={`text-${group.textColor} border-${group.textColor}`}
                            >
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                            <h2 className="font-black text-xl">{group.title}</h2>
                        </div>
                        <MenuCategories categories={groupedCategories[group.name]} group={group} />
                        <div className="flex w-full justify-between items-center">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                    setGroup(groups[(groupIndex - 1 + groups.length) % groups.length])
                                    setGroupIndex((groupIndex - 1 + groups.length) % groups.length)
                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                }}
                                className={`text-${group.textColor} border-${group.textColor} pr-1`}>
                                <p>{groups[(groupIndex - 1 + groups.length) % groups.length].name}</p>
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                    setGroup(groups[(groupIndex + 1) % groups.length])
                                    setGroupIndex((groupIndex + 1) % groups.length)
                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                }}
                                className={`text-${group.textColor} border-${group.textColor} pl-1`}>
                                <ChevronLeft className="w-5 h-5" />
                                <p>{groups[(groupIndex + 1) % groups.length].name}</p>
                            </Button>
                        </div>
                    </section>
                </div>
            </main>
        )
    }
}
