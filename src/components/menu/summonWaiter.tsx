"use client";

import { useState, useTransition, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textArea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radioGroup";
import { useToast } from "@/components/ui/toastContext";
import SeatSelector from "../admin/tokens/seatSelector";
import { Loader2, Hand, Check, Clock, AlertTriangle } from "lucide-react";
import { getStoredFingerprint } from "@/lib/device-fingerprint"
import { IToken } from "@/models/Token";
import { createSummon, checkSummonLimit } from "@/lib/data/summonData";
import { verifyToken } from "@/lib/data/tokenData";
import { formatCurrency } from "@/lib/utils";
import { createComment } from "@/lib/data/commentData";

type Token = Omit<IToken, "createdAt" | "updatedAt"> & { id: string };

interface FormCommentData {
  name?: string;
  email?: string;
  comment: string;
  answer?: string;
  verified: boolean;
}

export default function SummonWaiter() {
    const [step, setStep] = useState<
        "method" | "token" | "seat" | "intention" | "comment"
    >("seat");
    const [hasToken, setHasToken] = useState<boolean | null>(null);
    const [tokenNumber, setTokenNumber] = useState("");
    const [verifiedToken, setVerifiedToken] = useState<Token>();
    const [selectedSeat, setSelectedSeat] = useState<number>(0);
    const [intention, setIntention] = useState("");
    const [isPending, startTransition] = useTransition();
    const [deviceFingerprint, setDeviceFingerprint] = useState("");
    const [limitInfo, setLimitInfo] = useState<any>(null);
    const [countdown, setCountdown] = useState<number>(0);
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const intentions = ["سفارش", "پرسش در مورد منو", "شکایت یا نظر", "سایر"];

    useEffect(() => {
        if (typeof window !== "undefined") {
            const fingerprint = getStoredFingerprint();
            setDeviceFingerprint(fingerprint);

            // Check initial limit status
            startTransition(async () => {
                const result = await checkSummonLimit(fingerprint);
                setLimitInfo(result);

                if (!result.canSummon && result.remainingTime) {
                    setCountdown(Math.ceil(result.remainingTime / 1000));
                }
            });
        }
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (countdown > 0) {
            interval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        // Recheck limit when countdown ends
                        startTransition(async () => {
                            const result = await checkSummonLimit(
                                deviceFingerprint
                            );
                            setLimitInfo(result);
                        });
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [countdown, deviceFingerprint]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    const [newComment, setNewComment] = useState<FormCommentData>({
        name: "",
        email: "",
        comment: "",
        answer: "",
        verified: false,
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleCommentSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);

            await createComment(newComment);
            setNewComment({
                name: "",
                email: "",
                comment: "",
                answer: "",
                verified: false,
            });

            toast({
                title: "نظر شما ثبت شد!",
                description: "",
            });
        } catch (error: any) {
            toast({
                title: "خطا در ثبت نظر!",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
            setStep("seat");
            setHasToken(null);
            setTokenNumber("");
            setVerifiedToken(undefined);
            setSelectedSeat(0);
            setIntention("");
            setOpen(false);
            // Update limit info
            const limitResult = await checkSummonLimit(deviceFingerprint);
            setLimitInfo(limitResult);
            if (!limitResult.canSummon && limitResult.remainingTime) {
                setCountdown(Math.ceil(limitResult.remainingTime / 1000));
            }
        }
    };

    const handleMethodSelect = (method: string) => {
        const hasTokenValue = method === "token";
        setHasToken(hasTokenValue);
        setStep(hasTokenValue ? "token" : "seat");
    };

    const handleTokenVerification = () => {
        if (!tokenNumber.trim()) {
            toast({
                title: "خطا",
                description: "لطفاً شماره ژتون را وارد کنید",
                variant: "destructive",
            });
            return;
        }

        startTransition(async () => {
            const result = await verifyToken(Number.parseInt(tokenNumber));

            if (result.error) {
                toast({
                    title: "خطا",
                    description: result.error,
                    variant: "destructive",
                });
                setStep("seat");
            } else {
                setVerifiedToken(result.token);
                setSelectedSeat(result.token.seat);
                setStep("intention");
                toast({
                    title: "ژتون تأیید شد",
                    description: `ژتون شماره ${result.token.number} معتبر است`,
                });
            }
        });
    };

    const handleSeatSelect = (seat: number) => {
        setSelectedSeat(seat);
    };

    const handleSeatConfirm = () => {
        if (selectedSeat) {
            setStep("intention");
        }
    };

    const handleSummonSubmit = () => {
        if (!intention) {
            toast({
                title: "خطا",
                description: "لطفاً دلیل فراخوانی را انتخاب کنید",
                variant: "destructive",
            });
            return;
        }

        startTransition(async () => {
            const formData = new FormData();
            formData.append("deviceFingerprint", deviceFingerprint);
            if (verifiedToken?._id) {
                formData.append("tokenId", verifiedToken!._id.toString());
            }
            formData.append("seat", (selectedSeat || 1).toString());
            formData.append("intention", intention);
            console.log(formData.get("tokenId"));
            const result = await createSummon(formData);

            if (result.error) {
                toast({
                    title: "خطا",
                    description: result.error,
                    variant: "destructive",
                });
                // Update limit info after error
                const limitResult = await checkSummonLimit(deviceFingerprint);
                setLimitInfo(limitResult);
                if (!limitResult.canSummon && limitResult.remainingTime) {
                    setCountdown(Math.ceil(limitResult.remainingTime / 1000));
                }
            } else {
                toast({
                    title: "درخواست ارسال شد",
                    description: `ویتر به زودی نزد شما خواهد آمد. ${result.remainingSummons} فراخوانی باقی‌مانده`,
                });
                if (intention === "شکایت یا نظر") {
                    setStep("comment");
                } else {
                    setStep("seat");
                    setHasToken(null);
                    setTokenNumber("");
                    setVerifiedToken(undefined);
                    setSelectedSeat(0);
                    setIntention("");
                    setOpen(false);
                    // Update limit info
                    const limitResult = await checkSummonLimit(
                        deviceFingerprint
                    );
                    setLimitInfo(limitResult);
                    if (!limitResult.canSummon && limitResult.remainingTime) {
                        setCountdown(
                            Math.ceil(limitResult.remainingTime / 1000)
                        );
                    }
                }

                // Reset form
            }
        });
    };

    // Show rate limit warning if applicable
    if (limitInfo && !limitInfo.canSummon) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        size="lg"
                        className="px-4 border-2 border-qqteal"
                    >
                        <p className="text-sm font-[doran]">محدودیت فراخوانی</p>
                        <Hand className="w-5 h-5 text-qqorange" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg bg-amber-50 rounded-md">
                    <DialogHeader>
                        <DialogTitle>
                            <AlertTriangle className="h-6 w-6 text-amber-500" />
                            محدودیت فراخوانی
                        </DialogTitle>
                    </DialogHeader>
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-amber-800 mb-2">
                            {limitInfo.message}
                        </p>

                        {countdown > 0 && (
                            <div className="flex items-center justify-center gap-2 text-lg font-bold text-amber-700">
                                <Clock className="h-5 w-5" />
                                <span>{formatTime(countdown)}</span>
                            </div>
                        )}
                    </div>

                    <div className="text-sm text-gray-600">
                        <p>محدودیت‌های فراخوانی:</p>
                        <ul className="mt-2 space-y-1">
                            <li>• حداکثر 3 بار در روز</li>
                            <li>• فاصله 20 دقیقه بین هر فراخوانی</li>
                        </ul>
                    </div>

                    <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                        className="w-full"
                    >
                        بررسی مجدد
                    </Button>
                </DialogContent>
            </Dialog>
            // <div className="min-h-screen bg-gray-50 py-8 px-4">
            //     <div className="container mx-auto">
            //         <Card className="w-full max-w-md mx-auto">
            //             <CardHeader>
            //                 <CardTitle className="text-center flex items-center justify-center gap-2">
            //                     <AlertTriangle className="h-6 w-6 text-amber-500" />
            //                     محدودیت فراخوانی
            //                 </CardTitle>
            //             </CardHeader>
            //             <CardContent className="space-y-4 text-center">
            //                 <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            //                     <p className="text-amber-800 mb-2">
            //                         {limitInfo.message}
            //                     </p>

            //                     {countdown > 0 && (
            //                         <div className="flex items-center justify-center gap-2 text-lg font-bold text-amber-700">
            //                             <Clock className="h-5 w-5" />
            //                             <span>{formatTime(countdown)}</span>
            //                         </div>
            //                     )}
            //                 </div>

            //                 <div className="text-sm text-gray-600">
            //                     <p>محدودیت‌های فراخوانی:</p>
            //                     <ul className="mt-2 space-y-1">
            //                         <li>• حداکثر 3 بار در روز</li>
            //                         <li>• فاصله 20 دقیقه بین هر فراخوانی</li>
            //                     </ul>
            //                 </div>

            //                 <Button
            //                     onClick={() => window.location.reload()}
            //                     variant="outline"
            //                     className="w-full"
            //                 >
            //                     بررسی مجدد
            //                 </Button>
            //             </CardContent>
            //         </Card>
            //     </div>
            // </div>
        );
    }

    const renderStep = () => {
        switch (step) {
            case "method":
                return (
                    <Card className="w-full max-w-md mx-auto text-qqteal">
                        <CardHeader>
                            <CardTitle className="text-center">
                                <h3>آیا ژتون دارید؟</h3>
                            </CardTitle>
                            <CardDescription className="text-center">
                                {limitInfo &&
                                    limitInfo.remainingSummons !==
                                        undefined && (
                                        <div className="mt-2 text-sm text-amber-600">
                                            {limitInfo.remainingSummons}{" "}
                                            فراخوانی باقی‌مانده امروز
                                        </div>
                                    )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    variant="default"
                                    className="py-6 text-lg bg-qqteal"
                                    onClick={() => handleMethodSelect("token")}
                                >
                                    <span>ژتون دارم</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="py-6 text-lg"
                                    onClick={() => handleMethodSelect("seat")}
                                >
                                    <span>ژتون ندارم</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                );

            case "token":
                return (
                    <Card className="w-full max-w-md mx-auto text-qqteal">
                        <CardHeader>
                            <CardTitle className="text-center">
                                <h3 className="text-lg">
                                    شماره ژتون خود را وارد کنید:
                                </h3>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    id="token"
                                    type="number"
                                    placeholder="مثال: 42"
                                    value={tokenNumber}
                                    onChange={(e) =>
                                        setTokenNumber(e.target.value)
                                    }
                                    className="text-center text-lg"
                                />
                            </div>
                            <div className="flex gap-2">
                                {/* <Button
                                    variant="outline"
                                    onClick={() => setStep("method")}
                                    className="flex-1"
                                >
                                    بازگشت
                                </Button> */}
                                <Button
                                    onClick={handleTokenVerification}
                                    disabled={isPending}
                                    className="flex-1 bg-qqteal"
                                >
                                    {isPending && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    تأیید
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                );

            case "seat":
                return (
                    <div className="space-y-4">
                        <SeatSelector
                            onSelect={handleSeatSelect}
                            value={selectedSeat || undefined}
                        />
                        <div className="flex justify-center gap-2">
                            {/* <Button
                                variant="outline"
                                onClick={() => setStep("method")}
                            >
                                بازگشت
                            </Button> */}
                            <Button
                                onClick={handleSeatConfirm}
                                disabled={!selectedSeat}
                                className="bg-qqteal"
                            >
                                تأیید صندلی
                            </Button>
                        </div>
                    </div>
                );

            case "intention":
                return (
                    <Card className="w-full max-w-md mx-auto text-qqteal">
                        <CardHeader>
                            <CardTitle className="text-center">
                                {verifiedToken
                                    ? `ژتون: ${formatCurrency(
                                          verifiedToken.number
                                      )}`
                                    : `صندلی: ${formatCurrency(selectedSeat)}`}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <RadioGroup
                                value={intention}
                                onValueChange={setIntention}
                            >
                                {intentions.map((int) => (
                                    <div
                                        key={int}
                                        className="flex items-center space-x-2 space-x-reverse"
                                    >
                                        <RadioGroupItem value={int} id={int} />
                                        <Label
                                            htmlFor={int}
                                            className="flex-1 cursor-pointer text-base text-qqdarkbrown"
                                        >
                                            {int}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        setStep(hasToken ? "token" : "seat")
                                    }
                                    className="flex-1"
                                >
                                    بازگشت
                                </Button>
                                <Button
                                    onClick={handleSummonSubmit}
                                    disabled={isPending || !intention}
                                    className="flex-1 bg-qqteal"
                                >
                                    {isPending && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    فراخوانی ویتر
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                );

            case "comment":
                return (
                    <div className="container p-0 mx-auto max-w-5xl">
                        <Card className="m-0 mt-2 border-none">
                            <CardContent className="space-y-4 p-0">
                                <form
                                    onSubmit={handleCommentSubmit}
                                    className="space-y-4 p-6 rounded-lg bg-white border-none"
                                >
                                    <p className="text-qqteal">
                                        ویتر به زودی نزد شما خواهد آمد، در صورت
                                        تمایل نظر، پیشنهاد و یا انتقاد خود را با
                                        مدیر مجموعه در میان بگذارید:
                                    </p>
                                    <div
                                        dir="rtl"
                                        className="grid gap-4 sm:grid-cols-2"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <Label className="text-base font-medium text-qqdarkbrown">
                                                نام (اختیاری)
                                            </Label>
                                            <Input
                                                placeholder=""
                                                value={newComment.name}
                                                onChange={(e) =>
                                                    setNewComment({
                                                        ...newComment,
                                                        name: e.target.value,
                                                    })
                                                }
                                                className="w-2/3"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <Label className="block text-base font-medium text-qqdarkbrown">
                                                ایمیل (اختیاری)
                                            </Label>
                                            <Input
                                                type="email"
                                                value={newComment.email}
                                                onChange={(e) =>
                                                    setNewComment({
                                                        ...newComment,
                                                        email: e.target.value,
                                                    })
                                                }
                                                className="w-2/3"
                                            />
                                        </div>
                                        <div className="sm:col-span-2 space-y-1">
                                            <Label className="text-base font-medium text-qqdarkbrown">
                                                نظر، سوال، انتقاد یا پیشنهاد
                                                شما:
                                            </Label>
                                            <Textarea
                                                placeholder=""
                                                value={newComment.comment}
                                                onChange={(e) =>
                                                    setNewComment({
                                                        ...newComment,
                                                        comment: e.target.value,
                                                    })
                                                }
                                                required
                                                className="min-h-[100px]"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="bg-qqteal hover:bg-amber-600 text-base"
                                        >
                                            {isLoading
                                                ? "در حال ارسال"
                                                : "ارسال نظر"}
                                            {isLoading ? null : (
                                                <Check className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="lg"
                    className="px-4 border-2 border-qqteal"
                >
                    <p className="text-sm font-[doran]">فراخوانی ویتر</p>
                    <Hand className="w-5 h-5 text-qqorange" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg bg-amber-50 rounded-md">
                <DialogHeader>
                    <DialogTitle>فراخوانی ویتر:</DialogTitle>
                </DialogHeader>
                {renderStep()}
            </DialogContent>
        </Dialog>
    );
}
