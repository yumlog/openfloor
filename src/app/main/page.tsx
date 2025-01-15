"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import styles from "./main.module.scss";
import classNames from "classnames/bind";
import { LocomotiveScrollProvider } from "react-locomotive-scroll";
import Tilt from "react-parallax-tilt";
import Image from "next/image";
import TestIcon from "/public/images/window.svg";
import LinkIcon from "/public/images/icon-48-link.svg";
import DownloadIcon from "/public/images/icon-40-download.svg";
import EfficiencyIcon from "/public/images/icon-40-efficiency.svg";
import TechnologyIcon from "/public/images/icon-40-technology.svg";
import QualityIcon from "/public/images/icon-40-quality.svg";
import ContactIcon from "/public/images/icon-40-contact.svg";
import LogoBackground from "/public/images/logo-bg.svg";

const cx = classNames.bind(styles);

export default function Main() {
  // 스크롤 부드럽게
  const containerRef = useRef(null);

  // 배경이미지 호버시 이미지 움직이기
  const [posX, setPosX] = useState("-50%");
  const [posY, setPosY] = useState("-50%");
  const prevX = useRef(0);
  const prevY = useRef(0);

  const handleMouseMove = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const movedLeft = prevX.current > event.pageX;
    const movedUp = prevY.current > event.pageY;

    setPosX(movedLeft ? "-49%" : "-51%");
    setPosY(movedUp ? "-49%" : "-51%");

    prevX.current = event.pageX;
    prevY.current = event.pageY;
  };

  // 페이드인 모션
  const motionProps = {
    initial: { opacity: 0, y: 200 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false },
    transition: {
      ease: "easeInOut",
      duration: 1,
      y: { duration: 0.8 },
    },
  };

  const motionProps2 = {
    initial: { opacity: 0, y: 200 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false },
    transition: {
      ease: "easeInOut",
      duration: 1,
      y: { duration: 0.8 },
      delay: 1,
    },
  };

  // 커서 애니메이션
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
      }
    };

    const handleMouseEnter = () => {
      if (cursorRef.current) {
        cursorRef.current.classList.add(cx("hovered")); // 커서 크기/색상 변경
      }
    };

    const handleMouseLeave = () => {
      if (cursorRef.current) {
        cursorRef.current.classList.remove(cx("hovered")); // 원래 상태로 복구
      }
    };

    document.addEventListener("mousemove", handleMouseMove);

    // 특정 요소들에 이벤트 리스너 추가
    const hoverElements = document.querySelectorAll(cx(".hover-target"));
    hoverElements.forEach((element) => {
      element.addEventListener("mouseenter", handleMouseEnter);
      element.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      hoverElements.forEach((element) => {
        element.removeEventListener("mouseenter", handleMouseEnter);
        element.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, []);

  // 로고 애니메이션
  const pathRef = useRef<SVGPathElement | null>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (path) {
      path.style.animation = "draw 2s forwards, fill 1s 0.5s forwards";
    }
  }, []);

  return (
    <LocomotiveScrollProvider
      options={{
        smooth: true,
        smoothMobile: true,
        lerp: 0.02,
        direction: "vertical",
      }}
      watch={[]}
      containerRef={containerRef}
    >
      <main data-scroll-container ref={containerRef} className={cx("main")}>
        <div className={cx("custom-cursor")} ref={cursorRef} />
        <div className={cx("logo-bg")}>
          <LogoBackground />
        </div>
        <section data-scroll-section className={cx("section1")}>
          <div data-scroll data-scroll-speed="1">
            <svg
              width="180"
              height="180"
              viewBox="0 0 180 180"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                animation: "float 1s 1s both",
              }}
            >
              <path
                ref={pathRef}
                fillRule="evenodd"
                clipRule="evenodd"
                d="M89.8898 19L12.2833 151.219H12.28L7 160.219L172.79 160.22L167.51 151.219H167.506L95.1092 27.8911L95.11 27.8897L89.8898 19ZM154.465 146.787L94.5 44.6211V119.24L154.465 146.787ZM142.555 151.219L94.5 129.144V151.219H142.555ZM85.5 119.639V101.419L40.6466 139.845L85.5 119.639ZM85.5 44.2594L32.0128 135.391L85.5 89.5674V44.2594ZM85.5 129.51L37.3096 151.219H85.5V129.51Z"
                fill="#E32A2A"
                stroke="#E32A2A"
                strokeWidth="2"
                strokeDasharray="1000"
                strokeDashoffset="1000"
                style={{
                  fillOpacity: 0,
                  animation: "draw 2s forwards, fill 1s 0.5s forwards",
                }}
              />
              <style jsx>
                {`
                  path {
                    stroke-dasharray: 1000;
                    stroke-dashoffset: 1000;
                  }
                  @keyframes float {
                    from {
                      transform: translateY(85px);
                    }
                    to {
                      transform: translateY(0px);
                    }
                  }
                  @keyframes draw {
                    from {
                      stroke-dashoffset: 1000;
                    }
                    to {
                      stroke-dashoffset: 0;
                    }
                  }
                  @keyframes fill {
                    from {
                      fill-opacity: 0;
                    }
                    to {
                      fill-opacity: 1;
                    }
                  }
                `}
              </style>
            </svg>
            <motion.div {...motionProps2}>
              <h1>Openfloor Makes Quality</h1>
              <p>최고의 가치를 오픈플로어와 함께 합니다.</p>
            </motion.div>
          </div>
        </section>
        <section data-scroll-section className={cx("section2")}>
          <div data-scroll data-scroll-speed="-1">
            <motion.div {...motionProps}>
              <h1>
                Service
                <br />
                Philosophy
              </h1>
            </motion.div>
            <motion.div {...motionProps}>
              <ul className={cx("box-list")}>
                <li>
                  <EfficiencyIcon width={40} height={40} />
                  <p>Efficiency</p>
                  <ul className={cx("dot-list")}>
                    <li>불필요한 개발 과정 축소</li>
                    <li>결과를 극대화할 수 있는 리소스 보유</li>
                  </ul>
                </li>
                <li>
                  <TechnologyIcon width={40} height={40} />
                  <p>Technology</p>
                  <ul className={cx("dot-list")}>
                    <li>트랜드에 맞는 최신 기술력 보유</li>
                    <li>AI, 디지털 트윈 등 IT 트렌드 선도</li>
                  </ul>
                </li>
                <li>
                  <QualityIcon width={40} height={40} />
                  <p>Quality</p>
                  <ul className={cx("dot-list")}>
                    <li>다양한 경험을 통한 깔끔한 코드</li>
                    <li>파트별 검증 과정을 통한 높은 결과물</li>
                  </ul>
                </li>
                <li>
                  <ContactIcon width={40} height={40} />
                  <p>Contact</p>
                  <ul className={cx("dot-list")}>
                    <li>고객 맞춤형 상담과 신속한 피드백</li>
                    <li>원활한 소통으로 요구사항 파악</li>
                  </ul>
                  <button className={cx("hover-target")}>
                    <LinkIcon width={48} height={48} />
                  </button>
                </li>
              </ul>
            </motion.div>
            <div className={cx("scroll-down")}>
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="Scroll Icon">
                  <path
                    id="Vector"
                    d="M9.58594 15.0007C9.58594 9.2477 14.2496 4.58398 20.0026 4.58398C25.7556 4.58398 30.4193 9.2477 30.4193 15.0007V25.0007C30.4193 30.7536 25.7556 35.4173 20.0026 35.4173C14.2496 35.4173 9.58594 30.7536 9.58594 25.0007V15.0007Z"
                    stroke="black"
                    strokeWidth="2.5"
                  />
                  <path
                    id="Vector_2"
                    className="wheel-animation"
                    d="M18.3359 11.5C18.3359 10.672 19.0826 10 20.0026 10C20.9226 10 21.6693 10.672 21.6693 11.5V16C21.6693 16.828 20.9226 17.5 20.0026 17.5C19.0826 17.5 18.3359 16.828 18.3359 16V11.5Z"
                    fill="#E32A2A"
                  />
                </g>
                <style jsx>
                  {`
                    .wheel-animation {
                      animation: dropFade 1.5s infinite;
                    }

                    @keyframes dropFade {
                      0% {
                        transform: translateY(0);
                        opacity: 1;
                      }
                      100% {
                        transform: translateY(12px);
                        opacity: 0;
                      }
                    }
                  `}
                </style>
              </svg>
              <span>Scroll Down</span>
            </div>
          </div>
        </section>
        <section data-scroll-section className={cx("section3")}>
          <div data-scroll data-scroll-speed="-1">
            <motion.div {...motionProps}>
              <h1>Digital Marketing Counsulting</h1>
            </motion.div>
            <motion.div {...motionProps}>
              <ul className={cx("box-list")}>
                <li data-scroll data-scroll-speed="0">
                  <div>
                    <Image
                      aria-hidden
                      src="/images/cosulting.jpg"
                      alt="Window icon"
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <p>Consulting</p>
                  <ul className={cx("dot-list")}>
                    <li>시장 분석 기반 맞춤형 마케팅 전략</li>
                    <li>체계적인 성과 개선과 비즈니스 성장을 지원</li>
                  </ul>
                </li>
                <li data-scroll data-scroll-speed="1">
                  <div>
                    <Image
                      aria-hidden
                      src="/images/data-marketing.jpg"
                      alt="Window icon"
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <p>Data Marketing</p>
                  <ul className={cx("dot-list")}>
                    <li>PPC·SNS 광고와 A/B 테스트로 성과 최적화</li>
                    <li>ROI를 극대화하는 정교한 마케팅을 제공</li>
                  </ul>
                </li>
                <li data-scroll data-scroll-speed="2">
                  <div>
                    <Image
                      aria-hidden
                      src="/images/seo.jpg"
                      alt="Window icon"
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <p>SEO</p>
                  <ul className={cx("dot-list")}>
                    <li>SEO 콘텐츠로 가시성 및 고객 유입 증대</li>
                    <li>가치 있는 콘텐츠로 고객과 신뢰를 구축</li>
                  </ul>
                </li>
              </ul>
            </motion.div>
          </div>
        </section>
        <section data-scroll-section className={cx("section4")}>
          <div data-scroll data-scroll-speed="-1">
            <motion.div {...motionProps}>
              <Tilt
                className={cx("triangle-wrap")}
                tiltMaxAngleX={40}
                tiltMaxAngleY={40}
                perspective={800}
                transitionSpeed={1500}
                scale={1}
                gyroscope={true}
                trackOnWindow={true}
                // reset={false}
              >
                <Image
                  className={cx("triangle")}
                  aria-hidden
                  src="/images/triangle.png"
                  alt="Window icon"
                  width={385}
                  height={330}
                />
              </Tilt>
            </motion.div>
            <motion.div {...motionProps}>
              <div className={cx("text")}>
                <span>AI Consulting</span>
                <h1>Mastering AI Prompt</h1>
                <p>
                  기업의 핵심 문제를 해결하기 위해 맞춤형 AI 프롬프트를 설계하고
                  생산성을 극대화합니다.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
        <section data-scroll-section className={cx("section5")}>
          <div
            className={`move-background ${cx("bg-wrap")}`}
            onMouseMove={handleMouseMove}
          >
            <div
              className={`background ${cx("bg")}`}
              style={{
                transform: `translate(${posX}, ${posY})`,
                WebkitTransform: `translate(${posX}, ${posY})`, // 추가 호환성을 위해
              }}
            />
          </div>
          <div data-scroll data-scroll-speed="2" className={cx("section-wrap")}>
            <div className={cx("text")}>
              <motion.div {...motionProps}>
                <h1>Business Partner</h1>
                <p>
                  오픈플로어는 AI, 클라우드, 검색 기술을 바탕으로 기존 사업을
                  가속화하며,
                  <br />
                  비즈니스 파트너와 함께 새로운 성장 동력을 발굴하는 IT 기업을
                  지향합니다.
                </p>
              </motion.div>
              <motion.div {...motionProps}>
                <button className={cx("hover-target")}>
                  <DownloadIcon width={40} height={40} />
                  회사소개서 다운로드
                </button>
              </motion.div>
            </div>
          </div>
        </section>
        {/* <section data-scroll-section className={cx("section6")}>
          <div className={cx("marquee-container", "top")}>
            <motion.div
              className={cx("marquee")}
              animate={{
                x: ["0%", "-100%"],
              }}
              transition={{
                repeat: Infinity,
                repeatType: "loop",
                duration: 200,
                ease: "linear",
              }}
            >
              <span className={cx("text")}>
                {"Openfloor Makes Quality".repeat(10)}
              </span>
            </motion.div>
            <motion.div
              className={cx("marquee")}
              animate={{
                x: ["100%", "0%"],
              }}
              transition={{
                repeat: Infinity,
                repeatType: "loop",
                duration: 200,
                ease: "linear",
              }}
            >
              <span className={cx("text")}>
                {"Openfloor Makes Quality".repeat(10)}
              </span>
            </motion.div>
          </div>
          <div className={cx("marquee-container", "bottom")}>
            <motion.div
              className={cx("marquee")}
              animate={{
                x: ["-100%", "0%"],
              }}
              transition={{
                repeat: Infinity,
                repeatType: "loop",
                duration: 200,
                ease: "linear",
              }}
            >
              <span className={cx("text")}>
                {"Openfloor Makes Quality".repeat(10)}
              </span>
            </motion.div>
            <motion.div
              className={cx("marquee")}
              animate={{
                x: ["0%", "100%"],
              }}
              transition={{
                repeat: Infinity,
                repeatType: "loop",
                duration: 200,
                ease: "linear",
              }}
            >
              <span className={cx("text")}>
                {"Openfloor Makes Quality".repeat(10)}
              </span>
            </motion.div>
          </div>
          <ul className={cx("test")}>
            <li data-scroll data-scroll-speed="2">
              느려
            </li>
            <li data-scroll data-scroll-speed="-2">
              빨라
            </li>
          </ul>
        </section> */}
        <div data-scroll-section className={cx("footer")}>
          <p className={cx("name")}>OPENFLOOR</p>
          <div className={cx("address")}>
            <div>
              <p>
                <span>주소</span>서울 용산구 한강대로 379-2 은재빌딩 2층 (04320)
              </p>
            </div>
            <div>
              <p>
                <span>대표이사</span>이병윤
              </p>
              <p>
                <span>대표번호</span>0507-1371-6210
              </p>
              <p>
                <span>이메일</span>lee@openfloor.kr
              </p>
            </div>
            <div>
              <p>
                <span>사업자등록번호</span>715-88-00866
              </p>
            </div>
          </div>
          <p className={cx("copyright")}>
            COPYRIGHT © Openfloor ALL RIGHTS RESERVED.
          </p>
        </div>
      </main>
    </LocomotiveScrollProvider>
  );
}
