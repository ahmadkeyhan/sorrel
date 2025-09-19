"use client"

import type React from "react"

import { useState, useEffect, Children, isValidElement } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Slice } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SlideshowProps {
    children: React.ReactNode
    autoplayInterval?: number
    className?: string
  }

export default function Slideshow({ children, autoplayInterval = 5000, className = "" }: SlideshowProps) {
    // Convert children to array and filter out invalid elements
    const slides = Children.toArray(children).filter((child) => isValidElement(child))
  
    const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Handle edge case of empty items
  if (slides.length === 0) {
    return null
  }

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length)
  }

  // Autoplay functionality
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (!isPaused && slides.length > 1) {
      interval = setInterval(nextSlide, autoplayInterval)
    } else if (interval) {
        clearInterval(interval)
        interval = null
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [currentIndex, isPaused, slides.length, autoplayInterval])

  // Pause autoplay when hovering
  const handleMouseEnter = () => setIsPaused(true)
  const handleMouseLeave = () => setIsPaused(false)

  return (
    <div
      className={`relative overflow-hidden rounded-3xl ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-full h-full"
        >
          {slides[currentIndex]}
        </motion.div>
      </AnimatePresence>

      {/* Navigation dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? "bg-qqorange w-4" : "bg-qqcream"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Navigation arrows - only show if there's more than one item */}
      {slides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 bottom-2 bg-qqorange hover:bg-qqorange/50 text-white hover:text-qqdarkbrown rounded-full p-1"
            onClick={nextSlide}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 bottom-2 bg-qqorange hover:bg-qqorange/50 text-white hover:text-qqdarkbrown rounded-full p-1"
            onClick={prevSlide}
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}
    </div>
  )
}

