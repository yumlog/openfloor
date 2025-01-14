"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import styles from "./main.module.scss";
import classNames from "classnames/bind";
import { LocomotiveScrollProvider } from "react-locomotive-scroll";
import TestIcon from "/public/images/window.svg";

const cx = classNames.bind(styles);

export default function Main() {
  const containerRef = useRef(null);

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

  return (
    <LocomotiveScrollProvider
      options={{
        smooth: true,
        smoothMobile: true,
        lerp: 0.02,
      }}
      watch={[]}
      containerRef={containerRef}
    >
      <main data-scroll-container ref={containerRef}>
        <section data-scroll-section className={cx("section1")}>
          <motion.div
            initial={{ opacity: 0, y: 200 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{
              ease: "easeInOut",
              duration: 1,
              y: { duration: 0.8 },
            }}
          >
            <TestIcon width={160} height={142} />
            <h1>Openfloor Makes Quality</h1>
            <p>최고의 가치를 오픈플로어와 함께 합니다.</p>
          </motion.div>
        </section>
        <section data-scroll-section className={cx("section2")}>
          <motion.div
            initial={{ opacity: 0, y: 200 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{
              ease: "easeInOut",
              duration: 1,
              y: { duration: 0.8 },
            }}
          >
            <h1>
              Service
              <br />
              Philosophy
            </h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 200 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{
              ease: "easeInOut",
              duration: 1,
              y: { duration: 0.8 },
            }}
          >
            <ul className={cx("box-list")}>
              <li>
                <p>Consulting</p>
                <ul className={cx("dot-list")}>
                  <li>시장 분석 기반 맞춤형 마케팅 전략</li>
                  <li>체계적인 성과 개선과 비즈니스 성장을 지원</li>
                </ul>
              </li>
              <li>
                <p>Data Marketing</p>
                <ul className={cx("dot-list")}>
                  <li>PPC·SNS 광고와 A/B 테스트로 성과 최적화</li>
                  <li>ROI를 극대화하는 정교한 마케팅을 제공</li>
                </ul>
              </li>
              <li>
                <p>SEO</p>
                <ul className={cx("dot-list")}>
                  <li>SEO 콘텐츠로 가시성 및 고객 유입 증대</li>
                  <li>가치 있는 콘텐츠로 고객과 신뢰를 구축</li>
                </ul>
              </li>
              <li>
                <p>Contact</p>
                <ul className={cx("dot-list")}>
                  <li>고객 맞춤형 상담과 신속한 피드백</li>
                  <li>원활한 소통으로 요구사항 파악</li>
                </ul>
              </li>
            </ul>
          </motion.div>
          <div style={{ height: 380 }} />
          <motion.div
            initial={{ opacity: 0, y: 200 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{
              ease: "easeInOut",
              duration: 1,
              y: { duration: 0.8 },
            }}
          >
            <h1>Digital Marketing Counsulting</h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 200 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{
              ease: "easeInOut",
              duration: 1,
              y: { duration: 0.8 },
            }}
          >
            <ul className={cx("box-list")}>
              <li>
                <p>Consulting</p>
                <ul className={cx("dot-list")}>
                  <li>시장 분석 기반 맞춤형 마케팅 전략</li>
                  <li>체계적인 성과 개선과 비즈니스 성장을 지원</li>
                </ul>
              </li>
              <li>
                <p>Data Marketing</p>
                <ul className={cx("dot-list")}>
                  <li>PPC·SNS 광고와 A/B 테스트로 성과 최적화</li>
                  <li>ROI를 극대화하는 정교한 마케팅을 제공</li>
                </ul>
              </li>
              <li>
                <p>SEO</p>
                <ul className={cx("dot-list")}>
                  <li>SEO 콘텐츠로 가시성 및 고객 유입 증대</li>
                  <li>가치 있는 콘텐츠로 고객과 신뢰를 구축</li>
                </ul>
              </li>
            </ul>
          </motion.div>
        </section>
        <section data-scroll-section className={cx("section3")}>
          <h1>Mastering AI Prompt</h1>
        </section>
        <section data-scroll-section className={cx("section4")}>
          <h1>Business Partner</h1>
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
        </section>
        <div data-scroll-section className={cx("footer")}>
          OPENFLOOR
        </div>
      </main>
    </LocomotiveScrollProvider>
  );
}
