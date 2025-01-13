"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import styles from "./main.module.scss";
import classNames from "classnames/bind";
import Image from "next/image";
// import { SvgIcon } from '@/components/SvgIcon'
// import CounsultingIcon from '/public/images/icon-32-consulting.svg'


const cx = classNames.bind(styles);

export default function Main() {
  const { scrollY } = useScroll();
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };

    handleResize(); // 초기 실행
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 스크롤 범위에 따라 배경색 전환
  const backgroundColor = useTransform(
    scrollY,
    [0, viewportHeight / 1.2],
    ["rgba(0, 0, 0, 1)", "rgba(255, 255, 255, 1)"]
  );

  // 글자 크기 애니메이션
  const scale = useTransform(scrollY, [0, viewportHeight], [1, 70]);

  return (
    <div>
      <motion.section
        className={cx("section1")}
        style={{ backgroundColor }}
      >
        <motion.div
          className={cx("h1-wrap")}
          style={{ scale }}
          initial={{ scale: 1, x: "-50%", y: "-50%" }}
          animate= {{ scale: 50 }}
          transition={{
            ease: "easeIn",
          }}
        >
          <h1 className={cx("h1")}>Openfloor Makes Quality</h1>
        </motion.div>
      </motion.section>

      <section className={cx("section2")}>
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
          <h1 className={cx("h1")}>Service<br/>Philosophy</h1>
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
              <Image
                aria-hidden
                src="/images/icon-32-consulting.svg"
                alt="Consulting"
                width={32}
                height={32}
              />
              {/* <SvgIcon Icon={CounsultingIcon} width={32} height={32} /> */}
              <p>Consulting</p>
              <ul className={cx("dot-list")}>
                <li>시장 분석 기반 맞춤형 마케팅 전략</li>
                <li>체계적인 성과 개선과 비즈니스 성장을 지원</li>
              </ul>
            </li>
            <li>
              <Image
                aria-hidden
                src="/images/icon-32-data.svg"
                alt="Data Marketing"
                width={32}
                height={32}
              />
              <p>Data Marketing</p>
              <ul className={cx("dot-list")}>
                <li>PPC·SNS 광고와 A/B 테스트로 성과 최적화</li>
                <li>ROI를 극대화하는 정교한 마케팅을 제공</li>
              </ul>
            </li>
            <li>
              <Image
                aria-hidden
                src="/images/icon-32-seo.svg"
                alt="SEO"
                width={32}
                height={32}
              />
              <p>SEO</p>
              <ul className={cx("dot-list")}>
                <li>SEO 콘텐츠로 가시성 및 고객 유입 증대</li>
                <li>가치 있는 콘텐츠로 고객과 신뢰를 구축</li>
              </ul>
            </li>
            <li>
              <Image
                aria-hidden
                src="/images/icon-32-contact.svg"
                alt="Contact"
                width={32}
                height={32}
              />
              <p>Contact</p>
              <ul className={cx("dot-list")}>
                <li>고객 맞춤형 상담과 신속한 피드백</li>
                <li>원활한 소통으로 요구사항 파악</li>
              </ul>
            </li>
          </ul>
        </motion.div>
      </section>

      <section className={cx("section3")}>
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
            <span className={cx("text")}>{"Openfloor Makes Quality".repeat(10)}</span>
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
            <span className={cx("text")}>{"Openfloor Makes Quality".repeat(10)}</span>
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
            <span className={cx("text")}>{"Openfloor Makes Quality".repeat(10)}</span>
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
            <span className={cx("text")}>{"Openfloor Makes Quality".repeat(10)}</span>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
