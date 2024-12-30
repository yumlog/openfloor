"use client";
import Header from "@/components/Header";
import styles from "./main.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(styles);

export default function Main() {
  return (
    <div className="p-4">
      <Header />
      <div className={`p-2 ${cx("test")}`}>
        <span>📖페이지는 경로대로 링크가 돼요 3000/main</span>
      </div>
    </div>
  );
}
