"use client";

import { useState } from "react";

interface ProductGalleryProps {
  images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Mocking more images if only one provided for better demo
  const displayImages = images.length < 5 ? [...images, ...new Array(5 - images.length).fill("/assets/product-placeholder.png")] : images;

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full group">
      {/* Thumbnails Sidebar */}
      <div className="flex xl:flex-col gap-3 order-2 xl:order-1 overflow-x-auto xl:overflow-y-auto max-h-[100px] xl:max-h-[600px] scrollbar-hide">
        {displayImages.slice(0, 5).map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`w-14 h-14 xl:w-16 xl:h-16 rounded-xl border-2 flex-shrink-0 transition-all p-1 bg-white dark:bg-gray-800 ${activeIndex === idx ? "border-primary shadow-md" : "border-gray-100 dark:border-gray-700 opacity-60 hover:opacity-100"
              }`}
          >
            <div className="w-full h-full rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
              <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Main Display Area */}
      <div className="relative flex-1 bg-[#E8F1FC] dark:bg-gray-900 border border-blue-50 dark:border-gray-800 rounded-[2rem] flex items-center justify-center p-12 min-h-[400px] md:min-h-[600px] order-1 xl:order-2 overflow-hidden shadow-sm">
        {/* Main Content */}
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2rem] bg-[#9BB8F4] flex flex-col items-center justify-center mb-8 shadow-inner border border-blue-200">
            <div className="flex gap-2 mb-2">
              <div className="w-16 h-10 rounded bg-[#4F7EDE]"></div>
              <div className="w-6 h-10 rounded bg-[#4F7EDE]"></div>
            </div>
            <div className="w-24 h-4 rounded-full bg-[#4F7EDE]"></div>
          </div>

          <div className="text-[10px] font-bold text-blue-400 tracking-widest ">Front View</div>
        </div>

        <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-lg flex items-center justify-center hover:bg-white transition-all transform -translate-x-2 group-hover:translate-x-0">
            <svg className="w-5 h-5 text-gray-700 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-lg flex items-center justify-center hover:bg-white transition-all transform translate-x-2 group-hover:translate-x-0">
            <svg className="w-5 h-5 text-gray-700 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="absolute bottom-6 right-6 px-3 py-1 bg-gray-500/30 text-white text-[10px] font-bold rounded-lg backdrop-blur-md border border-white/10 tracking-widest">
          {activeIndex + 1} / {displayImages.length}
        </div>
      </div>
    </div>
  );
}
