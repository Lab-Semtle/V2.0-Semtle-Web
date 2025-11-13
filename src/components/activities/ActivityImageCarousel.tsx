'use client';

import * as React from "react";
import Image from 'next/image';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel";

interface ActivityImageCarouselProps {
    images: string[];
}

export default function ActivityImageCarousel({ images }: ActivityImageCarouselProps) {
    const [api, setApi] = React.useState<CarouselApi>();
    const [current, setCurrent] = React.useState(0);

    React.useEffect(() => {
        if (!api) {
            return;
        }

        setCurrent(api.selectedScrollSnap() + 1);

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);

    const scrollTo = (index: number) => {
        api?.scrollTo(index);
    };

    if (!images || images.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            {/* 메인 캐러셀 */}
            <Carousel setApi={setApi} className="w-full">
                <CarouselContent>
                    {images.map((image, index) => {
                        const isFirstImage = index === 0;
                        return (
                            <CarouselItem key={index}>
                                <div className="relative aspect-video w-full rounded-2xl overflow-hidden">
                                    <Image
                                        src={image}
                                        alt={`활동 이미지 ${index + 1}`}
                                        fill
                                        sizes="(min-width: 1280px) 1024px, (min-width: 1024px) 768px, (min-width: 768px) 640px, 100vw"
                                        className="object-cover"
                                        priority={isFirstImage}
                                        loading={isFirstImage ? undefined : 'lazy'}
                                        quality={isFirstImage ? 90 : 75}
                                    />
                                </div>
                            </CarouselItem>
                        );
                    })}
                </CarouselContent>
                {images.length > 1 && (
                    <>
                        <CarouselPrevious className="left-4" />
                        <CarouselNext className="right-4" />
                    </>
                )}
            </Carousel>

            {/* 미리보기 썸네일 */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => scrollTo(index)}
                            className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${current === index + 1
                                    ? 'border-blue-600 ring-2 ring-blue-300'
                                    : 'border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            <Image
                                src={image}
                                alt={`미리보기 ${index + 1}`}
                                fill
                                sizes="80px"
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}










