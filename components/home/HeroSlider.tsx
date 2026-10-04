"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./HeroSlider.module.css";

const slides = [
  {
    image: "/images/thrift-karo-hero-courtyard.png",
    alt: "Woman in a cream knit and vintage denim in a warm courtyard",
    eyebrow: "THE MAIN CHARACTER EDIT / 01",
    title: <>Before it becomes<br />someone else&apos;s <em>main character fit.</em></>,
    copy: <>AGAIN, THRIFT <span lang="ur" dir="rtl">کرو</span></>,
  },
  {
    image: "/images/thrift-karo-hero-atelier.png",
    alt: "Two friends in a refined vintage clothing atelier",
    eyebrow: "THE RE-WEAR EDIT / 02",
    title: <><em>Purana hai,</em><br />par vibe nayi hai.</>,
    copy: "The fit has a past. The energy is completely new.",
  },
  {
    image: "/images/thrift-karo-courtyard-campaign.png",
    alt: "Friends styled in a curated pre-loved fashion edit beside a clothes rail",
    eyebrow: "THE PRICE CHECK / 03",
    title: <>International fits.<br /><em>Desi prices.</em></>,
    copy: "Curated one-off pieces without the impossible price tag.",
  },
];

export function HeroSlider() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [isPaused]);

  const previousSlide = () => setActiveSlide((current) => (current - 1 + slides.length) % slides.length);
  const nextSlide = () => setActiveSlide((current) => (current + 1) % slides.length);

  return (
    <section className={styles.hero} aria-label="Thrift Karo featured campaign" aria-roledescription="carousel">
      <div className={styles.slideTrack}>
        {slides.map((slide, index) => (
          <article className={`${styles.slide} ${index === activeSlide ? styles.active : ""}`} key={slide.image} aria-hidden={index !== activeSlide}>
            <Image className={styles.image} src={slide.image} alt={slide.alt} fill priority={index === 0} sizes="100vw" />
            <div className={styles.shade} />
            <div className={styles.content}>
              <p className={styles.brand}>THRIFT <span lang="ur" dir="rtl">کرو</span></p>
              <p className={styles.eyebrow}>{slide.eyebrow}</p>
              <h1>{slide.title}</h1>
              <p className={styles.copy}>{slide.copy}</p>
              <Link className={styles.cta} href="/shop?availability=available">SHOP THE EDIT <ArrowUpRight size={18} /></Link>
            </div>
          </article>
        ))}
      </div>
      <div className={styles.utility}>
        <div className={styles.count}><span>0{activeSlide + 1}</span><i /> <span>0{slides.length}</span></div>
        <div className={styles.controls}>
          <button type="button" onClick={previousSlide} aria-label="Previous slide"><ArrowLeft size={17} /></button>
          <button type="button" onClick={() => setIsPaused((paused) => !paused)} aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}>{isPaused ? <Play size={15} fill="currentColor" /> : <Pause size={15} fill="currentColor" />}</button>
          <button type="button" onClick={nextSlide} aria-label="Next slide"><ArrowRight size={17} /></button>
        </div>
        <div className={styles.dots} role="tablist" aria-label="Choose featured campaign">
          {slides.map((slide, index) => <button key={slide.image} type="button" role="tab" aria-selected={index === activeSlide} aria-label={`Go to slide ${index + 1}`} onClick={() => setActiveSlide(index)} />)}
        </div>
      </div>
    </section>
  );
}
