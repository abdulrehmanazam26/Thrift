import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Asterisk, Eye, Ruler, RotateCcw } from "lucide-react";
import type { Product, Collection } from "@/lib/commerce/types";
import { ProductCard } from "@/components/product/ProductCard";
import { Newsletter } from "./Newsletter";
import { HeroSlider } from "./HeroSlider";
import styles from "./Home.module.css";

export function Home({ products, preview, newsletter }: {
  products: Product[];
  collections: Collection[];
  preview: boolean;
  newsletter: boolean;
}) {
  const available = products.filter((p) => p.stock > 0);

  return (
    <div className={styles.home}>
      <HeroSlider />
      <div className={styles.ribbon} aria-label="Pre-loved pieces, one-off finds, new possibilities">
        <span>GOOD CLOTHES. SECOND CHANCES.</span><Asterisk aria-hidden="true" /><span>STYLE IS PERSONAL.</span><Asterisk aria-hidden="true" /><span>KEEP THE GOOD GOING.</span><Asterisk aria-hidden="true" />
      </div>
      <section className={`section ${styles.latest}`} id="latest-edit">
        <div className="section-heading">
          <div><p className="eyebrow">THE LATEST FINDS</p><h2>A fresh <em className={styles.serif}>perspective.</em></h2></div>
          <Link className="text-link" href="/new-drop">EXPLORE THE DROP <ArrowUpRight size={18} /></Link>
        </div>
        {preview && <p className={styles.previewNote}><span>PREVIEW EDIT</span> Sample pieces & illustrative photography. Live inventory coming soon.</p>}
        {available.length > 0 ? <div className="product-grid">{available.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}</div> : <div className="empty-state"><h3>The next chapter is on its way.</h3><p>Check back for the next edit.</p><Link className="text-link" href="/archive">EXPLORE THE ARCHIVE <ArrowUpRight size={18} /></Link></div>}
      </section>
      <section className={`section ${styles.campaignFeatureSection}`} aria-label="The re-wear edit">
        <Link className={styles.campaignFeature} href="/shop?availability=available">
          <Image src="/images/thrift-karo-courtyard-campaign.png" alt="Two friends styled in a curated pre-loved fashion edit beside a clothes rail" fill sizes="(max-width: 760px) 100vw, 92vw" />
          <div className={styles.featureShade} />
          <div className={styles.featureCopy}>
            <p>THE RE-WEAR EDIT</p>
            <h2>Fashion with<br />a <em>past.</em></h2>
            <span>One-off finds, chosen for their next chapter.</span>
            <strong>SHOP THE EDIT <ArrowUpRight size={18} /></strong>
          </div>
        </Link>
      </section>
      <section className={styles.manifesto}>
        <div className={styles.manifestoCopy}>
          <p className="eyebrow">FOR THE ONES WHO FIND THEIR OWN WAY</p>
          <h2>NOT MADE<br />FOR EVERYONE.<br /><em>Found by you.</em></h2>
          <p>That perfect fade. That unexpected fit. The piece you didn’t know you were looking for. This is what finding your own style feels like.</p>
          <Link className="button butter-button" href="/shop?availability=available">FIND YOUR ONE <ArrowUpRight size={21} /></Link>
        </div>
        <div className={styles.manifestoArt}>
          <div className={styles.polaroid}><div><Image src="/images/streetwear.jpg" alt="Editorial streetwear styling inspiration, not a product listing" fill sizes="(max-width:700px) 74vw, 32vw" /></div><span>A LITTLE CHARACTER GOES A LONG WAY. <Asterisk size={21} /></span></div>
          <span className={styles.handwritten}>already loved.<br />not done yet.</span>
          <Asterisk className={styles.artStar} size={100} strokeWidth={1} aria-hidden="true" />
        </div>
      </section>
      <section className={`section ${styles.details}`}>
        <div className={styles.detailsIntro}><p className="eyebrow">LOOK GOOD. KNOW MORE.</p><h2>A good find.<br /><em className={styles.serif}>No guesswork.</em></h2><Link className="text-link" href="/about">THE THRIFT VAULT WAY <ArrowUpRight size={17} /></Link></div>
        <div className={styles.detailList}>
          {[
            { icon: Eye, title: "Character, clearly described.", text: "Condition grades and honest wear notes. Get to know the piece before you make it yours.", href: "/help/condition", label: "Condition guide" },
            { icon: Ruler, title: "Your fit, beyond the label.", text: "Compare garment measurements with a favorite you already own. Less hoping. More knowing.", href: "/help/sizing", label: "Sizing guide" },
            { icon: RotateCcw, title: "Good clothes. Another chapter.", text: "A different way to build your wardrobe, keeping the pieces worth wearing in the rotation.", href: "/about", label: "Our story" },
          ].map(({ icon: Icon, title, text, href, label }, i) => <Link href={href} className={styles.detailRow} key={title} aria-label={label}><span className={styles.detailIcon}><Icon size={25} strokeWidth={1.5} /></span><div><span className={styles.detailNumber}>0{i + 1}</span><h3>{title}</h3><p>{text}</p></div><ArrowUpRight size={20} /></Link>)}
        </div>
      </section>
      {available.length > 4 && <section className={`section ${styles.more}`}>
        <div className="section-heading"><div><p className="eyebrow">THE GOOD FINDS KEEP COMING</p><h2>Keep <em className={styles.serif}>looking.</em></h2></div><Link className="text-link" href="/shop">SHOP ALL PIECES <ArrowUpRight size={18} /></Link></div>
        <div className="product-grid">{available.slice(4, 8).map((p) => <ProductCard key={p.id} product={p} />)}</div>
      </section>}
      <Newsletter enabled={newsletter} />
      <section className={styles.finalCta}>
        <Asterisk size={49} strokeWidth={1.2} aria-hidden="true" />
        <p className="eyebrow">SOME THINGS ARE BETTER THE SECOND TIME.</p>
        <h2>Your next <em>great find.</em></h2>
        <Link className="button cobalt-button" href="/shop">IT’S IN THE VAULT <ArrowUpRight size={20} /></Link>
      </section>
    </div>
  );
}
