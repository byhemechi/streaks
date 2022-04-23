import Head from "next/head";
import "../styles/globals.css";
import logo from "../public/sadcloud.svg";
import Image from "next/image";

function StreaksApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>streaks</title>
      </Head>
      <header className="bg-neutral-100 dark:bg-neutral-800 text-xl font-semibold">
        <div className="max-w-screen-lg mx-auto p-4 px-10 flex items-center gap-4">
          <div className="flex justify-center items-center gap-2 w-12 h-12 rounded-md bg-gradient-to-br from-orange-600 to-purple-600 text-white p-1">
            <svg
              id="Layer_1"
              data-name="Layer 1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 500 500"
            >
              <defs>
                <style>
                  {
                    ".cls-5{stroke:#000;stroke-linejoin:round;stroke-width:.25px}"
                  }
                </style>
              </defs>
              <path
                d="M101.28 101h297v297.07h-297Z"
                style={{
                  fill: "none",
                }}
              />
              <path
                d="M353.1 222.51a105.1 105.1 0 0 0-196.38-28.06 84.13 84.13 0 0 0 9.12 167.77h182.35a69.93 69.93 0 0 0 4.91-139.71Z"
                style={{
                  strokeWidth: 12,
                  stroke: "#000",
                  strokeLinejoin: "round",
                  fill: "#fff",
                }}
              />
              <path
                d="m179.22 237.35 52.2-23.85m36.77 1.26 52.21 21.47"
                style={{
                  strokeWidth: 12,
                  stroke: "#000",
                  strokeLinejoin: "round",
                }}
              />
              <circle className="cls-5" cx={221.42} cy={259.02} r={11.03} />
              <circle className="cls-5" cx={276.44} cy={254.6} r={11.03} />
              <path
                d="M194.38 318.75s.28-22.45 56.69-24.7 61.75 20.21 61.75 20.21"
                style={{
                  strokeWidth: 12,
                  stroke: "#000",
                  strokeLinejoin: "round",
                  fill: "none",
                }}
              />
            </svg>
          </div>
          Score Streaks
        </div>
      </header>
      <Component {...pageProps} />
    </>
  );
}

export default StreaksApp;
