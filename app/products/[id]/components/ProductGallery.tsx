"use client";

import { useState } from "react";

interface ProductGalleryProps {
  images: string[];
}

const PLACEHOLDER = "/assets/product-placeholder.png";

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const realImages = images && images.length > 0 ? images : [PLACEHOLDER];
  // Always show exactly 5 thumbnails, pad with placeholders if needed
  const displayImages = realImages.length < 5
    ? [...realImages, ...new Array(5 - realImages.length).fill(PLACEHOLDER)]
    : realImages.slice(0, 5);
  const total = displayImages.length;

  const goPrev = () => setActiveIndex((prev) => (prev - 1 + total) % total);
  const goNext = () => setActiveIndex((prev) => (prev + 1) % total);

  const activeImage = displayImages[activeIndex];
  const isPlaceholder = !activeImage || activeImage === PLACEHOLDER;

  return (
    <div className="flex flex-col xl:flex-row gap-3 w-full group">
      {/* Thumbnail strip — no scroll, compact */}
      <div className="flex xl:flex-col gap-1.5 order-2 xl:order-1 flex-shrink-0">
        {displayImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`w-10 h-10 xl:w-11 xl:h-11 rounded-lg border-2 flex-shrink-0 transition-all p-0.5 bg-white dark:bg-gray-800 ${activeIndex === idx
              ? "border-primary shadow-md"
              : "border-gray-100 dark:border-gray-700 opacity-60 hover:opacity-100"
              }`}
          >
            <div className="w-full h-full rounded-md bg-gray-50 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {img && img !== PLACEHOLDER ? (
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              ) : (
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Main Display Area */}
      <div className="relative flex-1 bg-[#E8F1FC] dark:bg-gray-900 border border-blue-50 dark:border-gray-800 rounded-2xl flex items-center justify-center p-3 min-h-[100px] order-1 xl:order-2 overflow-hidden shadow-sm">
        {/* Main Image */}
        {!isPlaceholder ? (
          <img
            src={activeImage}
            alt={`Product image ${activeIndex + 1}`}
            className="max-h-[100px] md:max-h-[130px] w-auto object-contain"
            key={activeIndex}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-[#9BB8F4] flex items-center justify-center mb-1 shadow-inner border border-blue-200">
              <svg className="w-8 h-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-xs font-bold text-blue-400 tracking-widest">No Image</div>
          </div>
        )}

        {/* Prev / Next arrows — only if multiple images */}
        {total > 1 && (
          <div className="absolute inset-0 flex items-center justify-between px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <button
              onClick={goPrev}
              className="w-8 h-8 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-md flex items-center justify-center hover:bg-white transition-all pointer-events-auto"
            >
              <svg className="w-4 h-4 text-gray-700 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goNext}
              className="w-8 h-8 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-md flex items-center justify-center hover:bg-white transition-all pointer-events-auto"
            >
              <svg className="w-4 h-4 text-gray-700 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Counter badge */}
        {total > 1 && (
          <div className="absolute bottom-2 right-3 px-2 py-0.5 bg-gray-500/30 text-white text-xs font-bold rounded-md backdrop-blur-md border border-white/10 tracking-wider">
            {activeIndex + 1} / {total}
          </div>
        )}
      </div>
    </div>
  );
}
