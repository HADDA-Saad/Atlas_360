'use client'

export default function HeritageSection() {
  return (
    <section className="bg-background py-24 md:py-32 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left Column: Text */}
          <div className="flex flex-col gap-8 order-2 lg:order-1">
            <div className="flex flex-col gap-4">
              <span className="text-primary text-[10px] tracking-[0.3em] font-semibold uppercase">
                Our Heritage
              </span>
              <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl lg:text-6xl text-foreground font-semibold leading-tight">
                Tradition meets <br className="hidden md:block" /> contemporary luxury.
              </h2>
            </div>
            
            <div className="flex flex-col gap-6 text-muted-foreground text-base md:text-lg leading-relaxed font-light">
              <p>
                Atlas 360 was born from a passion for the untamed beauty of the Maghreb. 
                We believe travel should be more than just movement; it should be an 
                immersion into the rhythm of a culture that has endured for millennia.
              </p>
              <p>
                Our mission is to bridge the gap between the ancient soul of Morocco and 
                the needs of the modern traveler. Every itinerary is a hand-crafted 
                narrative, designed to lead you through secret medinas, towering peaks, 
                and the infinite stillness of the Sahara.
              </p>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <div className="h-[1px] w-12 bg-primary"></div>
              <span className="font-[family-name:var(--font-cormorant)] italic text-foreground text-xl">
                The Atlas 360 Founders
              </span>
            </div>
          </div>

          {/* Right Column: Masonry Image Grid */}
          <div className="order-1 lg:order-2 grid grid-cols-2 gap-4 md:gap-6">
            {/* Left Column of Grid */}
            <div className="flex flex-col gap-4 md:gap-6 pt-12">
              {/* Top Left Image */}
              <div className="relative w-full aspect-square rounded-sm overflow-hidden group">
                <img
                  src="/Images/Zellige.png"
                  alt="Moroccan geometric tile pattern"
                  className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              {/* Bottom Left Image */}
              <div className="relative w-full aspect-[4/3] rounded-sm overflow-hidden group">
                <img
                  src="/Images/riad.png"
                  alt="Traditional Moroccan courtyard riad"
                  className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

            {/* Right Column of Grid */}
            <div className="flex flex-col gap-4 md:gap-6">
              {/* Top Right Image */}
              <div className="relative w-full aspect-[4/3] rounded-sm overflow-hidden group">
                <img
                  src="/Images/spices.png"
                  alt="Colorful spices in a souk"
                  className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              {/* Bottom Right Image */}
              <div className="relative w-full aspect-[3/4] rounded-sm overflow-hidden group">
                <img
                  src="/Images/Zerbia.png"
                  alt="Woven Moroccan rug"
                  className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
