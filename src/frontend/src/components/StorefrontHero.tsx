export default function StorefrontHero() {
  return (
    <div className="relative w-full bg-gradient-to-br from-muted/50 to-muted/30 border-b">
      <div className="page-container py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
              Engineering Knowledge,
              <br />
              <span className="text-muted-foreground">Expertly Curated</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Access comprehensive engineering books and detailed technical notes. 
              Build your knowledge library with professionally crafted resources.
            </p>
          </div>
          <div className="relative aspect-[8/3] lg:aspect-[16/9] rounded-lg overflow-hidden shadow-lg">
            <img
              src="/assets/generated/hero-engineering-store.dim_1600x600.png"
              alt="Engineering resources"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
