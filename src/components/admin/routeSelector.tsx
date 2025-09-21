"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Command, CommandGroup, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

const urls = [
    // { name: "خانه", url: "" },
    { name: "منو", url: "/menu" },
    { name: "مارکت", url: "/market" }
]

interface RouteSelector {
  value: string
  onChange: (value: string) => void
}

export default function RouteSelector({ value, onChange }: RouteSelector) {
  const [open, setOpen] = useState(false)
  const [selectedUrl, setSelectedUrl] = useState<string>(value || "")

  useEffect(() => {
    if (value) {
      setSelectedUrl(value)
    }
  }, [value])

  const handleSelect = (url: string) => {
    
    setSelectedUrl(url)
    onChange(url)

    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full flex-row justify-between bg-amber-50 border-amber-200">
          <div dir="rtl" className="flex items-start gap-2">
            {selectedUrl.length > 0 ? (
              <>
                <span>{selectedUrl}</span>
              </>
            ) : (
              "انتخاب لینک"
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandGroup className=" overflow-y-auto">
              <div
                className="flex items-center gap-2 px-2 py-1.5 text-base rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleSelect("")}
              >
                <Check className={cn("h-4 w-4", !selectedUrl ? "opacity-100" : "opacity-0")} />
                <span>بدون لینک</span>
              </div>
              {urls.map((url) => {
                  return (
                    <div
                      key={url.name}
                      className="flex items-center gap-2 px-2 py-1.5 text-base rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handleSelect(url.url)}
                    >
                      <Check className={cn("h-4 w-4", selectedUrl === url.url ? "opacity-100" : "opacity-0")} />
                      <span>{url.name}</span>
                    </div>
                  )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

