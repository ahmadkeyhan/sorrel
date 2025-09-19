"use client";

import { useState, useTransition, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toastContext";
import { Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { getSummonById, updateSummonStatus } from "@/lib/data/summonData";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import SeatFinder from "@/components/admin/tokens/seatFinder";
import { notFound } from "next/navigation";
import Link from "next/link";

interface Summon {
    _id: string;
    tokenId?: {
        _id: string;
        number: number;
    };
    seat?: number;
    intention: string;
    isHandled: boolean;
    handling: boolean;
    handledBy?: string;
    handledAt?: Date;
    createdAt: string;
    updatedAt: string;
}

type Params = Promise<{ id: string }>;

export default function SummonPage(props: { params: Params }) {
    const { id } = use(props.params);
    const [summon, setSummon] = useState<Summon>();

    useEffect(() => {
        loadSummon();
    }, []);

    const loadSummon = async () => {
        const data = await getSummonById(id);
        setSummon(data);
        if (!summon) {
            notFound();
        }
    };

    const [isPending, startTransition] = useTransition();
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
    const { toast } = useToast();
    const router = useRouter();

    const handleUpdateStatus = (
        summonId: string,
        handling?: boolean,
        isHandled?: boolean
    ) => {
        setProcessingIds((prev) => new Set(prev).add(summonId));

        startTransition(async () => {
            const result = await updateSummonStatus(
                summonId,
                handling,
                isHandled
            );

            if (result.error) {
                toast({
                    title: "خطا",
                    description: result.error,
                    variant: "destructive",
                });
            } else {
                if (handling) {
                    toast({
                        title: "در حال رسیدگی",
                        description: "درخواست در حال پردازش است",
                    });
                } else if (isHandled) {
                    toast({
                        title: "تکمیل شد",
                        description: "درخواست با موفقیت انجام شد",
                    });
                }
                router.refresh();
                loadSummon()
            }

            setProcessingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(summonId);
                return newSet;
            });
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("fa-IR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getTimeDiff = (dateString: string) => {
        const now = new Date();
        const created = new Date(dateString);
        const diffMinutes = Math.floor(
            (now.getTime() - created.getTime()) / (1000 * 60)
        );

        if (diffMinutes < 1) return "همین الان";
        if (diffMinutes < 60) return `${diffMinutes} دقیقه پیش`;

        const diffHours = Math.floor(diffMinutes / 60);
        return `${diffHours} ساعت پیش`;
    };
    if (summon) {
        const isProcessing = processingIds.has(summon._id);
        return (
            <div className="space-y-6 container px-4">
                <div className="flex items-center justify-between p-4">
                    <div>
                        <p className="text-gray-600">فراخوانی ویتر</p>
                    </div>
                    <Button variant="outline">
                        <Link href="/admin">بازگشت به پنل</Link>
                    </Button>
                </div>

                <div>
                    <Card className="mb-4">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {summon.tokenId ? (
                                        <>
                                            <SeatFinder seat={summon.seat!} />
                                            <span className="font-semibold">
                                                ژتون{" "}
                                                {formatCurrency(
                                                    summon.tokenId.number
                                                )}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <SeatFinder seat={summon.seat!} />
                                            <span className="font-semibold">
                                                صندلی{" "}
                                                {formatCurrency(summon.seat!)}
                                            </span>
                                        </>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    {summon.isHandled ? (
                                        <Badge
                                            variant="secondary"
                                            className="bg-green-100 text-green-800"
                                        >
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            رسیدگی شده
                                        </Badge>
                                    ) : summon.handling ? (
                                        <Badge
                                            variant="secondary"
                                            className="bg-yellow-100 text-yellow-800"
                                        >
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            در حال رسیدگی
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="destructive"
                                            className="bg-qqorange"
                                        >
                                            <Clock className="h-3 w-3 mr-1" />
                                            در انتظار
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent dir="rtl">
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600">
                                        دلیل فراخوانی:
                                    </p>
                                    <p className="font-medium">
                                        {summon.intention}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <span>{formatTime(summon.createdAt)}</span>
                                    <span>{getTimeDiff(summon.createdAt)}</span>
                                </div>

                                {summon.handledBy && (
                                    <div className="text-sm text-gray-600">
                                        <span>رسیدگی شده توسط: </span>
                                        <span className="font-medium">
                                            {summon.handledBy}
                                        </span>
                                        {summon.handledAt && (
                                            <span className="mr-2">
                                                در{" "}
                                                {formatTime(
                                                    summon.handledAt.toString()
                                                )}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {!summon.isHandled && (
                                    <div className="flex gap-2 pt-2">
                                        {!summon.handling ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    handleUpdateStatus(
                                                        summon._id,
                                                        true,
                                                        false
                                                    )
                                                }
                                                disabled={isProcessing}
                                            >
                                                {isProcessing && (
                                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                )}
                                                شروع رسیدگی
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    handleUpdateStatus(
                                                        summon._id,
                                                        false,
                                                        true
                                                    )
                                                }
                                                disabled={isProcessing}
                                                className="bg-qqteal"
                                            >
                                                {isProcessing && (
                                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                )}
                                                رسیدگی شد
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    } else {
                return (
            <div className="space-y-6 container px-4">
                <div className="flex items-center justify-between p-4">
                    <div>
                        <p className="text-gray-600">فراخوانی ویتر</p>
                    </div>
                    <Button variant="outline">
                        <Link href="/admin">بازگشت به پنل</Link>
                    </Button>
                </div>

                <div>
                    <Card className="mb-4">

                        <CardContent dir="rtl" className="flex justify-center items-center">
                            <p>در حال بارگیری ...</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }
}
