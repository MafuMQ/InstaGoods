import { useRef, useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function CarouselWithDots({ categories }: { categories: any[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaApi, setEmblaApi] = useState<any>(null);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi]);

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
              <section className="relative h-[400px] overflow-hidden">
                <img
                  src={category.image}
                  alt={category.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 to-foreground/40" />
                <div className="absolute inset-0 flex items-center">
                  <div className="container">
                    <div className="max-w-2xl text-background">
                      <h1 className="text-5xl font-bold mb-4">
                        {category.title}
                      </h1>
                      <p className="text-xl mb-6 text-background/90">
                        {category.description}
                      </p>
                      <Link to={category.link}>
                        <Button size="lg" variant="secondary">
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
      </Carousel>
      <div className="flex justify-center gap-2 mt-4">
        {categories.map((_, idx) => (
          <button
            key={idx}
            className={`h-3 w-3 rounded-full transition-colors ${selectedIndex === idx ? "bg-primary" : "bg-muted-foreground/30"}`}
            onClick={() => emblaApi && emblaApi.scrollTo(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}