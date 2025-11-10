import SimpleNav from "@/components/blocks/simple-nav";
import SimpleHero from "@/components/blocks/simple-hero";

export default function Home() {
  return (
    <div className="min-h-screen bg-muted/50">
      <SimpleNav />
      <SimpleHero />
    </div>
  );
}
