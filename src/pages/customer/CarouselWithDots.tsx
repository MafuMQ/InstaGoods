import { useRef, useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CarouselWithDots({ categories }: { categories: any[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaApi, setEmblaApi] = useState<any>(null);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <div className="relative overflow-hidden">
      <Carousel
        opts={{ loop: true }}
        plugins={[Autoplay({ delay: 5000 })]}
        className="w-full"
        setApi={setEmblaApi}
      >
        <CarouselContent>
          {categories.map((category, index) => (
            <CarouselItem key={index}>
              <section className="relative h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] overflow-hidden">
                {/* Background Image */}
                <img
                  src={category.image}
                  alt={category.title}
                  className="h-full w-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/60 to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-0 flex items-center">
                  <div className="container">
                    <div className="max-w-lg lg:max-w-2xl text-background px-4 sm:px-6">
                      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 leading-tight">
                        {category.title}
                      </h1>
                      <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 text-background/90 line-clamp-2 sm:line-clamp-none">
                        {category.description}
                      </p>
                      <Link to={category.link}>
                        <Button 
                          size="lg" 
                          variant="secondary"
                          className="gap-2 text-sm sm:text-base"
                        >
                          Shop Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Navigation Arrows - Desktop Only */}
        <div className="hidden md:flex absolute top-1/2 -left-4 -translate-y-1/2 z-10">
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-full shadow-lg"
            onClick={scrollPrev}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
        <div className="hidden md:flex absolute top-1/2 -right-4 -translate-y-1/2 z-10">
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-full shadow-lg"
            onClick={scrollNext}
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </Carousel>
      
      {/* Dot Indicators */}
      <div className="flex justify-center gap-2 py-3 sm:py-4 px-4">
        {categories.map((_, idx) => (
          <button
            key={idx}
            className={`h-2 w-2 sm:h-3 sm:w-3 rounded-full transition-all duration-300 ${
              selectedIndex === idx 
                ? "bg-primary w-6 sm:w-8" 
                : "bg-muted-foreground/40 hover:bg-muted-foreground/60"
            }`}
            onClick={() => emblaApi && emblaApi.scrollTo(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            aria-current={selectedIndex === idx ? "true" : "false"}
          />
        ))}
      </div>
    </div>
  );
}
