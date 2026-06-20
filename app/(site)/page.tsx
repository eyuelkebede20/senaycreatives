import { Hero } from "@/components/sections/hero";
import { PartnersStrip } from "@/components/sections/partners-strip";
import { ServicesOverview } from "@/components/sections/services-overview";
import { FeaturedProjects } from "@/components/sections/featured-projects";
import { Testimonials } from "@/components/sections/testimonials";
import { CallToAction } from "@/components/sections/cta";

export default function Home() {
  return (
    <>
      <Hero />
      <PartnersStrip />
      <ServicesOverview />
      <FeaturedProjects />
      <Testimonials />
      <CallToAction />
    </>
  );
}
