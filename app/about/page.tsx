import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
export const metadata = {
  title: "Our Story",
  description:
    "Good clothing deserves another chapter. Discover the idea behind Thrift Vault.",
  alternates: { canonical: "/about" },
};
export default function Page() {
  return (
    <>
      <section className="about-intro section">
        <p className="eyebrow">THE IDEA BEHIND THRIFT VAULT</p>
        <h1>
          NOT NEW.
          <br />
          STILL WORTH
          <br />
          WEARING<span className="acid">.</span>
        </h1>
        <div className="about-statement">
          <p>
            Style isn’t about owning something new.
            <br />
            It’s about making something your own.
          </p>
          <p>
            We believe good clothing deserves another chapter. The washed denim.
            The perfectly relaxed layer. The piece you didn’t know you were
            looking for until you found it.
          </p>
        </div>
      </section>
      <div className="about-campaign">
        <Image
          src="/images/campaign.webp"
          alt="Thrift Vault editorial campaign featuring relaxed workwear"
          fill
          sizes="100vw"
        />
      </div>
      <section className="section about-values">
        <p className="eyebrow">A WARDROBE WITH A POINT OF VIEW</p>
        <div>
          <h2>
            LESS OF THE SAME.
            <br />
            MORE OF YOURSELF.
          </h2>
          <p>
            Thrift Vault is a destination for discovering pre-loved fashion with
            character. We make space for the unexpected, the individual, and the
            pieces that deserve to be worn again.
          </p>
          <p>
            Buying pre-loved keeps clothing in use for longer. No complicated
            promises. Just another life for a good piece.
          </p>
          <Link href="/shop" className="button dark">
            FIND YOUR NEXT CHAPTER <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
