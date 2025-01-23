"use client";

import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { LocomotiveScrollProvider } from "react-locomotive-scroll";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import SwiperCore from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Tilt from "react-parallax-tilt";
import Image from "next/image";
import LinkIcon from "/public/images/icon-48-link.svg";
import DownloadIcon from "/public/images/icon-36-download.svg";
import EfficiencyIcon from "/public/images/icon-40-efficiency.svg";
import TechnologyIcon from "/public/images/icon-40-technology.svg";
import QualityIcon from "/public/images/icon-40-quality.svg";
import ContactIcon from "/public/images/icon-40-contact.svg";
import LeftIcon from "/public/images/icon-20-arrow-left.svg";
import RightIcon from "/public/images/icon-20-arrow-right.svg";
import LogoBackground from "/public/images/logo-bg.svg";
import IbmLogo from "/public/images/logo-ibm.svg";
import IntelLogo from "/public/images/logo-intel.svg";
import AmazonLogo from "/public/images/logo-amazon.svg";
import CiscoLogo from "/public/images/logo-cisco.svg";
import NetflixLogo from "/public/images/logo-netflix.svg";
import OracleLogo from "/public/images/logo-oracle.svg";
import HeaderLogo from "/public/images/logo-white.svg";
import styles from "@/app/_styles/main.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(styles);

export default function Main() {
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

  const motionProps3 = {
    initial: { opacity: 0, y: 200 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false },
    transition: {
      ease: "easeInOut",
      duration: 1,
      y: { duration: 0.8, delay: 0.4 },
      delay: 0.4,
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
        cursorRef.current.classList.add(cx("hovered"));
      }
    };

    const handleMouseLeave = () => {
      if (cursorRef.current) {
        cursorRef.current.classList.remove(cx("hovered"));
      }
    };

    document.addEventListener("mousemove", handleMouseMove);

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

  // 스크롤 부드럽게 + 렌더링후 2초 스크롤 막기
  const containerRef = useRef(null);
  const scrollRef = useRef<any>(null);
  const [isScrollDisabled, setScrollDisabled] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setScrollDisabled(false);
      if (scrollRef.current) {
        scrollRef.current.start();

        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTo(window.innerHeight, {
              offset: 0,
            });
          }
        }, 0);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // 스와이퍼 관련
  const handleInit = (swiper: SwiperCore) => {
    // swiper.wrapperEl은 swiper-wrapper 요소를 참조합니다.
    swiper.wrapperEl.classList.add(cx("open-swiper-wrapper"));
  };

  return (
    <LocomotiveScrollProvider
      options={{
        smooth: true,
        smoothMobile: true,
        lerp: 0.02,
        direction: "vertical",
        smartphone: {
          smooth: true,
        },
        tablet: {
          smooth: true,
        },
      }}
      watch={[]}
      containerRef={containerRef}
      onUpdate={(scroll: any) => {
        scrollRef.current = scroll;
        if (isScrollDisabled) {
          scroll.stop();
        }
      }}
    >
      <main data-scroll-container ref={containerRef} className={cx("main")}>
        <section data-scroll-section className={cx("section1")}>
          <div
            data-scroll
            data-scroll-speed="1"
            className={cx("section-inner")}
          >
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
                fill="var(--primary)"
                stroke="var(--primary)"
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
                      transform: translateY(50%);
                    }
                    to {
                      transform: translateY(0%);
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
              <div className={cx("text")}>
                <h1>Openfloor Makes Quality</h1>
                <p>최고의 가치를 오픈플로어와 함께 합니다.</p>
              </div>
            </motion.div>
          </div>
        </section>
        <section data-scroll-section className={cx("section2")}>
          <div
            data-scroll
            data-scroll-speed="-1"
            className={cx("section-inner")}
          >
            <motion.div {...motionProps}>
              <h1>
                Service
                <br />
                Philosophy
              </h1>
            </motion.div>
            <motion.div {...motionProps}>
              <Swiper
                modules={[Navigation]}
                spaceBetween={24}
                breakpoints={{
                  500: {
                    slidesPerView: 1,
                  },
                  800: {
                    slidesPerView: 2,
                  },
                  1100: {
                    slidesPerView: 3,
                  },
                  1500: {
                    slidesPerView: 4,
                  },
                }}
                navigation={{
                  prevEl: `.${cx("open-swiper-nav-prev")}`,
                  nextEl: `.${cx("open-swiper-nav-next")}`,
                }}
                loop={true}
                className={cx("open-swiper")}
                slideActiveClass={cx("open-swiper-slide-active")}
                onInit={handleInit}
                onSlideChange={() => console.log("slide change")}
              >
                <SwiperSlide
                  className={cx("open-swiper-slide")}
                  data-scroll
                  data-scroll-speed="0"
                >
                  <EfficiencyIcon width={40} height={40} />
                  <p>Efficiency</p>
                  <ul className={cx("dot-list")}>
                    <li>불필요한 개발 과정 축소</li>
                    <li>결과를 극대화할 수 있는 리소스 보유</li>
                  </ul>
                </SwiperSlide>
                <SwiperSlide
                  className={cx("open-swiper-slide")}
                  data-scroll
                  data-scroll-speed="1"
                >
                  <TechnologyIcon width={40} height={40} />
                  <p>Technology</p>
                  <ul className={cx("dot-list")}>
                    <li>트랜드에 맞는 최신 기술력 보유</li>
                    <li>AI, 디지털 트윈 등 IT 트렌드 선도</li>
                  </ul>
                </SwiperSlide>
                <SwiperSlide
                  className={cx("open-swiper-slide")}
                  data-scroll
                  data-scroll-speed="0"
                >
                  <QualityIcon width={40} height={40} />
                  <p>Quality</p>
                  <ul className={cx("dot-list")}>
                    <li>다양한 경험을 통한 깔끔한 코드</li>
                    <li>파트별 검증 과정을 통한 높은 결과물</li>
                  </ul>
                </SwiperSlide>
                <SwiperSlide
                  className={cx("open-swiper-slide")}
                  data-scroll
                  data-scroll-speed="-1"
                >
                  <ContactIcon width={40} height={40} />
                  <p>Contact</p>
                  <ul className={cx("dot-list")}>
                    <li>고객 맞춤형 상담과 신속한 피드백</li>
                    <li>원활한 소통으로 요구사항 파악</li>
                  </ul>
                  <button className={cx("hover-target")}>
                    <LinkIcon width={48} height={48} />
                  </button>
                </SwiperSlide>
                <button className={cx("open-swiper-nav-prev", "hover-target")}>
                  <LeftIcon width={20} height={20} />
                </button>
                <button className={cx("open-swiper-nav-next", "hover-target")}>
                  <RightIcon width={20} height={20} />
                </button>
              </Swiper>
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
                    stroke="var(--white)"
                    strokeWidth="2.5"
                  />
                  <path
                    id="Vector_2"
                    className="wheel-animation"
                    d="M18.3359 11.5C18.3359 10.672 19.0826 10 20.0026 10C20.9226 10 21.6693 10.672 21.6693 11.5V16C21.6693 16.828 20.9226 17.5 20.0026 17.5C19.0826 17.5 18.3359 16.828 18.3359 16V11.5Z"
                    fill="var(--primary)"
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
          <div
            data-scroll
            data-scroll-speed="-1"
            className={cx("section-inner")}
          >
            <div className={cx("text")}>
              <motion.div {...motionProps}>
                <h1>
                  Digital Marketing
                  <br />
                  Counsulting
                </h1>
              </motion.div>
              <motion.div {...motionProps}>
                <p>
                  맞춤형 전략과 데이터 기반 마케팅으로 ROI를 극대화하며,
                  <br />
                  콘텐츠와 SEO로 브랜드 가시성과 고객 유입을 높입니다.
                </p>
              </motion.div>
            </div>
            <motion.div {...motionProps3} className={cx("swiper-test")}>
              <Swiper
                modules={[Pagination]}
                spaceBetween={40}
                breakpoints={{
                  500: {
                    slidesPerView: 1,
                  },
                  768: {
                    slidesPerView: 2,
                  },
                  1280: {
                    slidesPerView: 3,
                  },
                  1600: {
                    slidesPerView: 2.4,
                  },
                }}
                pagination={{
                  clickable: true,
                  el: `.${cx("open-swiper-pagination")}`,
                  bulletClass: cx("open-swiper-pagination-bullet"),
                  bulletActiveClass: cx("open-swiper-pagination-active"),
                }}
                className={cx("open-swiper")}
                slideActiveClass={cx("open-swiper-slide-active")}
                onInit={handleInit}
                onSlideChange={() => console.log("slide change")}
                onSwiper={(swiper) => {
                  // Swiper 인스턴스를 저장하거나 초기 설정
                  swiper.on("slideChange", () => {
                    // 슬라이드 이동 제한 (3번째 인덱스까지만 허용)
                    if (swiper.activeIndex > 2) {
                      swiper.slideTo(2); // 강제로 2번째 인덱스로 이동
                    }
                  });
                  swiper.on("touchMove", () => {
                    // 드래그 제한 (3번째 인덱스까지만 허용)
                    if (swiper.activeIndex > 2) {
                      swiper.slideTo(2); // 강제로 2번째 인덱스로 이동
                    }
                  });
                }}
              >
                <SwiperSlide className={cx("open-swiper-slide")}>
                  <Image
                    aria-hidden
                    src="/images/cosulting.jpg"
                    alt="Window icon"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                  <div className={cx("item")}>
                    <p>Consulting</p>
                    <small>
                      시장 분석 기반 맞춤형 마케팅 전략
                      <br />
                      체계적인 성과 개선과 비즈니스 성장을 지원
                    </small>
                  </div>
                </SwiperSlide>
                <SwiperSlide className={cx("open-swiper-slide")}>
                  <Image
                    aria-hidden
                    src="/images/data-marketing.jpg"
                    alt="Window icon"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                  <div className={cx("item")}>
                    <p>Data Marketing</p>
                    <small>
                      PPC·SNS 광고와 A/B 테스트로 성과 최적화
                      <br />
                      ROI를 극대화하는 정교한 마케팅을 제공
                    </small>
                  </div>
                </SwiperSlide>
                <SwiperSlide className={cx("open-swiper-slide")}>
                  <Image
                    aria-hidden
                    src="/images/seo.jpg"
                    alt="Window icon"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                  <div className={cx("item")}>
                    <p>SEO</p>
                    <small>
                      SEO 콘텐츠로 가시성 및 고객 유입 증대
                      <br />
                      가치 있는 콘텐츠로 고객과 신뢰를 구축
                    </small>
                  </div>
                </SwiperSlide>
                {Array.from({ length: 2 }).map((_, index) => (
                  <SwiperSlide
                    key={`empty-slide-${index}`} // 고유한 key 추가
                    className={cx("open-swiper-slide", "empty")}
                  >
                    빈공간
                  </SwiperSlide>
                ))}
                <div className={cx("open-swiper-pagination")}></div>
              </Swiper>
            </motion.div>
          </div>
        </section>
        <section data-scroll-section className={cx("section4")}>
          <div
            className={cx("section-wrap")}
            data-scroll
            data-scroll-speed="-1"
          >
            <motion.div {...motionProps}>
              <div className={cx("text")}>
                <h1>Mastering AI Prompt</h1>
                <p>
                  기업의 핵심 문제를 분석해 AI 맞춤형 프롬프트를 설계하고,
                  <br />
                  자동화로 일관된 결과와 생산성을 극대화합니다.
                  <br />
                  이를 통해 스마트 업무 환경을 구축하고 비즈니스 성과를
                  강화합니다.
                </p>
              </div>
            </motion.div>
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
                  src="/images/triangle-sample.png"
                  alt="Window icon"
                  width={385}
                  height={330}
                />
              </Tilt>
            </motion.div>
          </div>
        </section>
        <section data-scroll-section className={cx("section5")}>
          <div className={cx("text")}>
            <motion.div {...motionProps}>
              <h1>Business Partner</h1>
            </motion.div>
            <motion.div {...motionProps}>
              <Tilt
                tiltMaxAngleX={20}
                tiltMaxAngleY={20}
                perspective={1000}
                transitionSpeed={1500}
                scale={1.1}
                gyroscope={false}
                glareEnable={true}
                glareMaxOpacity={0.5}
                glareColor="#fff"
                glarePosition="all"
                glareBorderRadius="100px"
              >
                <button className={cx("hover-target")}>
                  <DownloadIcon width={40} height={40} />
                  회사소개서 다운로드
                </button>
              </Tilt>
            </motion.div>
          </div>
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
              <span className={cx("marquee-text")}>
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
              <div className={cx("partner")}>
                {Array.from({ length: 10 }).map((_, index) => (
                  <ul key={`partner-list-${index}`}>
                    <li className={cx("ibm")}>
                      <IbmLogo />
                    </li>
                    <li className={cx("intel")}>
                      <IntelLogo />
                    </li>
                    <li className={cx("amazon")}>
                      <AmazonLogo />
                    </li>
                    <li className={cx("cisco")}>
                      <CiscoLogo />
                    </li>
                    <li className={cx("netflix")}>
                      <NetflixLogo />
                    </li>
                    <li className={cx("oracle")}>
                      <OracleLogo />
                    </li>
                  </ul>
                ))}
              </div>
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
              <div className={cx("partner")}>
                {Array.from({ length: 10 }).map((_, index) => (
                  <ul key={`partner-list-${index}`}>
                    <li>
                      <IbmLogo width={83} height={34} />
                    </li>
                    <li>
                      <IntelLogo width={66} height={44} />
                    </li>
                    <li>
                      <AmazonLogo width={118} height={36} />
                    </li>
                    <li>
                      <CiscoLogo width={84} height={48} />
                    </li>
                    <li>
                      <NetflixLogo width={120} height={32} />
                    </li>
                    <li>
                      <OracleLogo width={223} height={30} />
                    </li>
                  </ul>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
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
        <header className={cx("header")}>
          <button className={cx("hover-target")}>
            <HeaderLogo width={40} height={40} />
            OPENFLOOR
          </button>
        </header>
        <div className={cx("custom-cursor")} ref={cursorRef} />
        <div className={cx("logo-bg")}>
          <LogoBackground />
        </div>
      </main>
    </LocomotiveScrollProvider>
  );
}
