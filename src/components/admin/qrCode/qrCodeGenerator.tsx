"use client";

import { useState, useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, QrCode, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/toastContext";
import ImageUploader from "@/components/admin/imageUploader";
import RouteSelector from "../routeSelector";

export default function QRCodeGenerator() {
  const [url, setUrl] = useState("");
  const [baseUrl, setBaseUrl] = useState("")
  // const [previewSize, setPreviewSize] = useState(200); // Fixed size for preview
  const previewSize = 200;
  const [downloadSize, setDownloadSize] = useState(200); // Size for downloads
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [logoImage, setLogoImage] = useState("");
  const [logoSize, setLogoSize] = useState(20);
  const qrRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Set default URL to the current site
  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin)
    }
  }, []);

  // Calculate logo size as percentage of QR code size
  const getLogoSizePixels = (forDownload = false) => {
    const baseSize = forDownload ? downloadSize : previewSize;
    return Math.round((logoSize / 100) * baseSize);
  };

  const handleDownloadPNG = () => {
    if (!qrRef.current) return;

    try {
      const svg = qrRef.current.querySelector("svg");
      if (!svg) return;

      // Create a new canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size to match download size
      canvas.width = downloadSize;
      canvas.height = downloadSize;

      // Convert SVG to a data URL
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      // Create a new image to draw on canvas
      const img = new Image();
      img.crossOrigin = "anonymous";

      // When image loads, draw it on canvas and create download
      img.onload = () => {
        // Draw the QR code, scaling to the download size
        ctx.drawImage(img, 0, 0, downloadSize, downloadSize);

        // If there's a logo, draw it on top
        if (logoImage) {
          const logoImg = new Image();
          logoImg.crossOrigin = "anonymous";
          logoImg.onload = () => {
            // Calculate position to center the logo
            const logoSizePixels = getLogoSizePixels(true);
            const x = (downloadSize - logoSizePixels) / 2;
            const y = (downloadSize - logoSizePixels) / 2;

            // Draw logo on top of QR code
            ctx.drawImage(logoImg, x, y, logoSizePixels, logoSizePixels);

            // Convert to PNG and trigger download
            finalizePngDownload(canvas);
          };
          logoImg.src = logoImage;
        } else {
          // No logo, just finalize the download
          finalizePngDownload(canvas);
        }
      };

      // Load the QR code image
      img.src = svgUrl;
    } catch (error) {
      console.error("Error downloading PNG:", error);
      toast({
        title: "دانلود انجام نشد!",
        description: "دانلود فایل png انجام نشد.",
        variant: "destructive",
      });
    }
  };

  // Add this helper function for PNG download
  const finalizePngDownload = (canvas: HTMLCanvasElement) => {
    try {
      const pngFile = canvas.toDataURL("image/png");

      // Create download link
      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-code-${url}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();

      toast({
        title: "کیوآر کد دانلود شد!",
        description: "دانلود فایل png انجام شد.",
      });
    } catch (error) {
      console.error("Error finalizing PNG download:", error);
      toast({
        title: "دانلود انجام نشد!",
        description: "ایجاد فایل png با مشکل مواجه شد.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadSVG = () => {
    if (!qrRef.current) return;

    try {
      const svg = qrRef.current.querySelector("svg");
      if (!svg) return;

      // Clone the SVG to avoid modifying the displayed one
      const clonedSvg = svg.cloneNode(true) as SVGElement;

      // If there's a logo, we need to embed it directly in the SVG
      if (logoImage && getImageSettings()) {
        // Find the image element in the cloned SVG
        const imageElement = clonedSvg.querySelector("image");

        if (imageElement) {
          // Create a new image to load the logo
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            // Create a canvas to convert the image to a data URL
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // Set canvas size to match logo size
            const logoSize = getLogoSizePixels(true);
            canvas.width = logoSize;
            canvas.height = logoSize;

            // Draw the logo on the canvas
            ctx.drawImage(img, 0, 0, logoSize, logoSize);

            // Convert to data URL
            const dataUrl = canvas.toDataURL("image/png");

            // Update the image href in the SVG
            imageElement.setAttribute("href", dataUrl);

            // Now finalize the SVG download
            finalizeSvgDownload(clonedSvg);
          };
          img.src = logoImage;
        } else {
          finalizeSvgDownload(clonedSvg);
        }
      } else {
        finalizeSvgDownload(clonedSvg);
      }
    } catch (error) {
      console.error("Error downloading SVG:", error);
      toast({
        title: "دانلود انجام نشد!",
        description: "دانلود فایل svg انجام نشد.",
        variant: "destructive",
      });
    }
  };

  const finalizeSvgDownload = (svgElement: SVGElement) => {
    try {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      const downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = `qr-code-${url}.svg`;
      downloadLink.click();

      URL.revokeObjectURL(svgUrl);

      toast({
        title: "کیوآر کد دانلود شد!",
        description: "دانلود فایل svg انجام شد.",
      });
    } catch (error) {
      console.error("Error finalizing SVG download:", error);
      toast({
        title: "دانلود انجام نشد!",
        description: "ایجاد فایل svg با مشکل مواجه شد.",
        variant: "destructive",
      });
    }
  };

  // Prepare image settings for QRCodeSVG
  const getImageSettings = () => {
    if (!logoImage) return undefined;

    return {
      src: logoImage,
      height: getLogoSizePixels(false),
      width: getLogoSizePixels(false),
      excavate: true,
    };
  };

  return (
    <div dir="rtl" className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="basic">
            <TabsList className="mb-4 flex flex-wrap bg-amber-100 text-teal-700">
              <TabsTrigger value="basic" className="flex-grow">
                <QrCode />
              </TabsTrigger>
              <TabsTrigger value="logo" className="flex-grow">
                <ImagePlus />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div dir="rtl" className="grid gap-8 grid-cols-2">
                <div className="flex flex-col gap-2 col-span-2 sm:col-span-1">
                  <Label htmlFor="url">آدرس کیوآر</Label>
                  <RouteSelector value={url.slice(baseUrl.length - url.length)} onChange={(route) => setUrl(baseUrl + route)} />
                </div>
                <div className="flex flex-col gap-4 col-span-2 sm:col-span-1">
                  <Label>{`ابعاد دانلود: ${downloadSize} پیکسل`}</Label>
                  <Slider
                    dir="rtl"
                    value={[downloadSize]}
                    min={100}
                    max={2400}
                    step={50}
                    onValueChange={(value) => setDownloadSize(value[0])}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="fgColor">رنگ پیش‌زمینه</Label>
                  <Input
                    id="fgColor"
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="bgColor">رنگ پس‌زمینه</Label>
                  <Input
                    id="bgColor"
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="logo" className="space-y-4">
              <div className="space-y-2">
                <ImageUploader value={logoImage} onChange={setLogoImage} />
              </div>
              {logoImage && (
                <div className="space-y-2">
                  <Label>ابعاد لوگو: %{logoSize}</Label>
                  <Slider
                    dir="rtl"
                    value={[logoSize]}
                    min={10}
                    max={24}
                    step={1}
                    onValueChange={(value) => setLogoSize(value[0])}
                  />
                  <p className="text-base text-teal-600">
                    ابعاد واقعی: {getLogoSizePixels(true)} پیکسل × {getLogoSizePixels(true)} پیکسل
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 flex flex-col items-center">
          <div
            ref={qrRef}
            className="mb-6 rounded-[0.125rem] border-2 border-teal-700 flex items-center justify-center"
            style={{
              width: `${previewSize + 16}px`,
              height: `${previewSize + 16}px`,
            }}
          >
            <QRCodeSVG
              value={url}
              size={previewSize}
              bgColor={bgColor}
              fgColor={fgColor}
              level="H"
              marginSize={4}
              imageSettings={getImageSettings()}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <Button onClick={handleDownloadPNG}>
              <Download className="w-4 h-4" />
              <p dir="rtl">دانلود PNG</p>
            </Button>
            <Button onClick={handleDownloadSVG}>
              <Download className="w-4 h-4" />
              <p dir="rtl">دانلود SVG</p>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
