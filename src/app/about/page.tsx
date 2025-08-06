import { Facebook, Github, Instagram, Youtube } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="container mx-auto py-12 px-4 md:px-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold  mb-4 text-center">
          About Us
        </h1>
        <p className="text-center text-lg  mb-12 max-w-2xl mx-auto">
          Welcome to RateMyCafe! Our story, mission, and vision.
        </p>

        {/* This section is now centered and has a max width */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-semibold  mb-3">Our Story</h2>
          <p className=" leading-relaxed mb-4">
            CafeRater was born from a simple idea: that finding a great cafe
            should not be a gamble. We believe that every local coffee shop,
            cozy corner, and vibrant roastery has a unique story to tell, and
            that the best way to discover it is through honest, community-driven
            reviews.
          </p>
          <p className=" leading-relaxed">
            Our mission is to build a platform where cafe lovers can share their
            genuine experiences, from the perfect latte to the most comfortable
            study spot. We have created a space where you can rate cafes not
            just on the quality of their coffee, but on the ambiance, the
            service, and the value they offer.
          </p>
        </div>

        {/* This section is also now centered with a max width */}
        <div className="mt-12 max-w-2xl mx-auto">
          <h2 className="text-3xl font-semibold mb-3">What We Do</h2>
          <p className=" leading-relaxed mb-4">
            CafeRater is a simple, intuitive cafe rating system that empowers
            you to:
          </p>
          <ul className="list-disc list-inside leading-relaxed space-y-2">
            <li>
              <strong>Discover new spots</strong> in your area or while
              traveling.
            </li>
            <li>
              <strong>Share your genuine opinions</strong> through ratings and
              reviews.
            </li>
            <li>
              <strong>Connect with a community</strong> of fellow cafe
              enthusiasts.
            </li>
            <li>
              <strong>Help local businesses</strong> get the recognition they
              deserve.
            </li>
          </ul>
        </div>
        <div className="mt-12 max-w-2xl mx-auto">
          <h2 className="text-3xl font-semibold mb-3">
            Why Are We Creating This System?
          </h2>
          <p className=" leading-relaxed mb-4">
            Many people love spending time in cafes for different reasons — to
            relax, catch up with friends, or work remotely. However:
          </p>
          <ul className="list-disc list-inside leading-relaxed space-y-2">
            <li>
              Reviews are often general and not specific to things like work
              environment or vibe.
            </li>
            <li>
              It’s hard to find cafes tailored to personal preferences (e.g.,
              best productivity spot).
            </li>
            <li>
              Platforms like Google Maps/Yelp are not focused on the _cafe
              experience.
            </li>
          </ul>
        </div>

        {/* This section was already centered */}
        <div className=" mt-12 max-w-2xl mx-auto">
          <h2 className="text-3xl font-semibold  mb-3">Our Vision</h2>
          <p className="leading-relaxed max-w-2xl mx-auto">
            We envision a world where the search for the perfect cafe is always
            successful. Our goal is to become the go-to platform for honest,
            transparent cafe discovery, fueled by the passion of our users.
          </p>
          <p className=" leading-relaxed max-w-2xl mx-auto mt-4">
            Join us, and help us build the definitive guide to the worlds best
            cafes, one rating at a time.
          </p>
        </div>
      </div>

      {/* Founders Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-semibold mb-8 text-center">Founder</h2>
        <div className="flex justify-center gap-8">
          {/* Sokheng Chen */}
          <div className=" border-2 rounded-2xl shadow-md p-6 w-80">
            <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden mb-4">
              <Image
                src="/me.jpg"
                alt="Sopheaktra"
                layout="fill"
                objectFit="cover"
              />
            </div>
            <h3 className="text-xl font-semibold  text-center mb-1">
              Chuon Sopheaktra
            </h3>
            <p className=" text-center text-sm mb-4">Fullstack Developer</p>
            <div className="flex justify-around  text-lg rounded-lg ">
              <Link href="#" target="_blank" rel="noopener noreferrer">
                <Youtube />
              </Link>
              <Link href="#" target="_blank" rel="noopener noreferrer">
                <Facebook />
              </Link>
              <Link href="#" target="_blank" rel="noopener noreferrer">
                <Github />
              </Link>
              <Link href="#" target="_blank" rel="noopener noreferrer">
                <Instagram />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Donate? Section */}
      <section className="mb-16 text-center">
        <h2 className="text-3xl font-semibold  mb-8">Why Donate Us?</h2>
        <ol className="list-decimal list-inside text-lg  mb-6 max-w-xl mx-auto text-left">
          <li className="mb-4">
            <strong>Maintain our independence:</strong> By remaining a
            privately-funded platform, we are able to provide impartial and
            unbiased reviews free from the influence of outside entities.
          </li>
          <li className="mb-4">
            <strong>Expand our coverage:</strong> Your donation will help us
            expand our reach and cover even more cofffe shop, ensuring that more
            user have access to accurate and reliable information.
          </li>
          <li className="mb-4">
            <strong>Improve our platform:</strong> Your donation will allow us
            to make continual improvements to our platform, enhancing the user
            experience and delivering even more value to our users.
          </li>
        </ol>
        <p className=" max-w-2xl mx-auto">
          Every donation, no matter the size, makes a difference in helping us
          achieve our mission. Thank you for your generosity and for being a
          part of Transparency Project
        </p>
      </section>

      <div className="flex flex-col items-center md:flex-row gap-5 ">
        <Image src="/aba.png" alt="logo" width={130} height={130} />
        <div className=" text-2xl text-center font-bold">
          <p>500 032 770</p>
          <p>CHUON SOPHEAKTRA</p>
        </div>
        <Link
          href={
            "https://link.payway.com.kh/aba?id=451BB3E727E1&code=019723&acc=500032770&dynamic=true"
          }
        >
          <Image src="/qr.png" alt="logo" width={130} height={130} />
        </Link>
      </div>
    </div>
  );
}
