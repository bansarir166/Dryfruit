import Hero from "@/components/Hero";
import Collection from "@/components/Collection";
import FeaturedProducts from "@/components/FeaturedProducts";
import BrandStory from "@/components/BrandStory";
import QualitySection from "@/components/QualitySection";
import BuildYourBox from "@/components/BuildYourBox";
import GiftSection from "@/components/GiftSection";
import NouraEdit from "@/components/NouraEdit";
import Testimonials from "@/components/Testimonials";
import InstagramGallery from "@/components/InstagramGallery";
import Newsletter from "@/components/Newsletter";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Collection />
      <FeaturedProducts />
      <BrandStory />
      <QualitySection />
      <BuildYourBox />
      <GiftSection />
      <NouraEdit />
      <Testimonials />
      <InstagramGallery />
      <Newsletter />
    </>
  );
}
