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
import LogoBackground from "/public/images/logo-bg.svg";
import Logo from "/public/images/logo.svg";

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
            <motion.div {...motionProps}>
              <Logo width={160} height={142} />
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
                  <TestIcon width={32} height={32} />
                  <p>Efficiency</p>
                  <ul className={cx("dot-list")}>
                    <li>불필요한 개발 과정 축소</li>
                    <li>결과를 극대화할 수 있는 리소스 보유</li>
                  </ul>
                </li>
                <li>
                  <TestIcon width={32} height={32} />
                  <p>Technology</p>
                  <ul className={cx("dot-list")}>
                    <li>트랜드에 맞는 최신 기술력 보유</li>
                    <li>AI, 디지털 트윈 등 IT 트렌드 선도</li>
                  </ul>
                </li>
                <li>
                  <TestIcon width={32} height={32} />
                  <p>Quality</p>
                  <ul className={cx("dot-list")}>
                    <li>다양한 경험을 통한 깔끔한 코드</li>
                    <li>파트별 검증 과정을 통한 높은 결과물</li>
                  </ul>
                </li>
                <li>
                  <button className={cx("hover-target")}>
                    <LinkIcon width={48} height={48} />
                  </button>
                  <TestIcon width={32} height={32} />
                  <p>Contact</p>
                  <ul className={cx("dot-list")}>
                    <li>고객 맞춤형 상담과 신속한 피드백</li>
                    <li>원활한 소통으로 요구사항 파악</li>
                  </ul>
                </li>
              </ul>
            </motion.div>
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
                  <div></div>
                  <p>Consulting</p>
                  <ul className={cx("dot-list")}>
                    <li>시장 분석 기반 맞춤형 마케팅 전략</li>
                    <li>체계적인 성과 개선과 비즈니스 성장을 지원</li>
                  </ul>
                </li>
                <li data-scroll data-scroll-speed="1">
                  <div></div>
                  <p>Data Marketing</p>
                  <ul className={cx("dot-list")}>
                    <li>PPC·SNS 광고와 A/B 테스트로 성과 최적화</li>
                    <li>ROI를 극대화하는 정교한 마케팅을 제공</li>
                  </ul>
                </li>
                <li data-scroll data-scroll-speed="2">
                  <div></div>
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
          <motion.div {...motionProps}>
            <div className={cx("text")}>
              <h1>Business Partner</h1>
              <p>
                오픈플로어는 AI, 클라우드, 검색 기술을 바탕으로 기존 사업을
                가속화하며,
                <br />
                비즈니스 파트너와 함께 새로운 성장 동력을 발굴하는 IT 기업을
                지향합니다.
              </p>
              <button className={cx("hover-target")}>
                <DownloadIcon width={40} height={40} />
                회사소개서 다운로드
              </button>
            </div>
          </motion.div>
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
          OPENFLOOR
        </div>
      </main>
    </LocomotiveScrollProvider>
  );
}
