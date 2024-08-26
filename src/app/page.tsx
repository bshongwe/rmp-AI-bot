"use client";

import { useRef } from "react";
import { HeroWithOrbitingCircles } from "./(components)/Hero2";
import { MarqueeDemo } from "./(components)/Reviews";
import { StickyHeader } from "./(components)/Header";

export default function Home() {
  const containerRef = useRef(null);

  return (
    <main
      ref={containerRef}
      className=" bg-black h-full w-full overflow-y-auto"
    >
      <StickyHeader containerRef={containerRef} />
      <HeroWithOrbitingCircles />
      <div className="flex justify-center items-center w-full px-4">
        <div className="max-w-screen-lg w-full" id="reviews">
          <MarqueeDemo />
        </div>
      </div>
      <div>
        <section
          id="clients"
          className="text-center mx-auto max-w-[80rem] px-6 md:px-8"
        >
          <div className="py-14">
            <div className="mx-auto max-w-screen-xl px-4 md:px-8">
              <h2 className="text-center text-2xl font-bold     text-white">
                DEVELOPMENT TEAM
              </h2>
              <div className="mt-6">
                <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-16">
                  <li className="flex flex-col items-center">
                    <img
                      src="https://media.licdn.com/dms/image/v2/D4D03AQHzZyxCao64vA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1687957091647?e=1730332800&v=beta&t=CIMK0Xix-eiNQUOunyfxlZjgpo0ZoIKK4f8q0pzdDoU"
                      alt="Boniface Munga"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                    <p className="mt-2 text-center text-sm font-medium text-white">Boniface Munga</p>
                  </li>
                  <li className="flex flex-col items-center">
                    <img
                      src="https://media.licdn.com/dms/image/v2/D5603AQEAh49Veb_-vw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1691688973647?e=1730332800&v=beta&t=YqglArp38JsVHJFGwRUZCEQjUHMJFFAeu0w5YG5f5zc"
                      alt="Salman Qurban"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                    <p className="mt-2 text-center text-sm font-medium text-white">Salman Qurban</p>
                  </li>
                  <li className="flex flex-col items-center">
                    <img
                      src="https://avatars.githubusercontent.com/u/126109055?v=4"
                      alt="Ernest Shongwe"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                    <p className="mt-2 text-center text-sm font-medium text-white">Ernest Shongwe</p>
                  </li>
                  <li className="flex flex-col items-center">
                    <img
                      src="https://i.pravatar.cc/150?img=17"
                      alt="Bruce Rogers"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                    <p className="mt-2 text-center text-sm font-medium text-white">Bruce Rogers</p>
                  </li>
                </ul>
              </div>
              <br />
              <br />
            </div>
          </div>
        </section>
      </div>


    </main>
  );
}