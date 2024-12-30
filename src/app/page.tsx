import Header from "@/components/Header";
import Button from "@/components/Button";
import TextField from "@/components/Forms/TextField";
import TextArea from "@/components/Forms/TextArea";
import Image from "next/image";

export default function Main() {
  return (
    <div className={`flex flex-col gap-4 p-4`}>
      <Header />
      <section className="border">
        <h1 className="text-h5 font-bold border-b px-4 py-2 ">Font Size</h1>
        <ul className="flex flex-col gap-4 p-4">
          <li className="text-h1 font-bold">H1 오픈플로어</li>
          <li className="text-h2 font-bold">H2 오픈플로어</li>
          <li className="text-h3 font-bold">H3 오픈플로어</li>
          <li className="text-h4 font-bold">H4 오픈플로어</li>
          <li className="text-h5 font-bold">H5 오픈플로어</li>
          <li className="text-lg">Body1 오픈플로어</li>
          <li className="text-md">Body2 오픈플로어</li>
          <li className="text-sm">Body3 오픈플로어</li>
          <li className="text-xs">Body4 오픈플로어</li>
        </ul>
      </section>
      <section className="border">
        <h1 className="text-h5 font-bold border-b px-4 py-2 ">Font Weight</h1>
        <ul className="flex flex-col gap-4 p-4">
          <li className="text-lg font-thin">
            Pretendard Thin, 오픈플로어 최고의 가치, 1234567890
          </li>
          <li className="text-lg font-extralight">
            Pretendard ExtraLight, 오픈플로어 최고의 가치, 1234567890
          </li>
          <li className="text-lg font-light">
            Pretendard Light, 오픈플로어 최고의 가치, 1234567890
          </li>
          <li className="text-lg font-normal">
            Pretendard Normal, 오픈플로어 최고의 가치, 1234567890
          </li>
          <li className="text-lg font-medium">
            Pretendard Medium, 오픈플로어 최고의 가치, 1234567890
          </li>
          <li className="text-lg font-semibold">
            Pretendard SemiBold, 오픈플로어 최고의 가치, 1234567890
          </li>
          <li className="text-lg font-bold">
            Pretendard Bold, 오픈플로어 최고의 가치, 1234567890
          </li>
          <li className="text-lg font-extrabold">
            Pretendard ExtraBold, 오픈플로어 최고의 가치, 1234567890
          </li>
          <li className="text-lg font-black">
            Pretendard Black, 오픈플로어 최고의 가치, 1234567890
          </li>
        </ul>
      </section>
      <section className="border">
        <h1 className="text-h5 font-bold border-b px-4 py-2 ">Color</h1>
        <div className="flex flex-col gap-4 p-4">
          <ul className="grid grid-cols-5 gap-4">
            <li className="flex flex-col gap-1 rounded-[6px] bg-primary p-4 text-white">
              <span className="text-sm">Primary</span>
              <span className="font-normal">#E32A2A</span>
            </li>
            <li className="flex flex-col gap-1 rounded-[6px] bg-red-1 p-4 text-white">
              <span className="text-sm">Red-1</span>
              <span className="font-normal">#ED3C3C</span>
            </li>
            <li className="flex flex-col gap-1 rounded-[6px] bg-black p-4 text-white">
              <span className="text-sm">Black</span>
              <span className="font-normal">#000000</span>
            </li>
            <li className="flex flex-col gap-1 rounded-[6px] bg-white p-4 border border-gray-3">
              <span className="text-sm">White</span>
              <span className="font-normal">#FFFFFF</span>
            </li>
          </ul>
          <ul className="grid grid-cols-5 gap-4">
            <li className="flex flex-col gap-1 rounded-[6px] bg-gray-9 p-4 text-white">
              <span className="text-sm">Gray9</span>
              <span className="font-normal">#0D0D0D</span>
            </li>
            <li className="flex flex-col gap-1 rounded-[6px] bg-gray-8 p-4 text-white">
              <span className="text-sm">Gray8</span>
              <span className="font-normal">#2B2B2B</span>
            </li>
            <li className="flex flex-col gap-1 rounded-[6px] bg-gray-7 p-4 text-white">
              <span className="text-sm">Gray7</span>
              <span className="font-normal">#474747</span>
            </li>
            <li className="flex flex-col gap-1 rounded-[6px] bg-gray-6 p-4 text-white">
              <span className="text-sm">Gray6</span>
              <span className="font-normal">#666666</span>
            </li>
            <li className="flex flex-col gap-1 rounded-[6px] bg-gray-5 p-4 text-white">
              <span className="text-sm">Gray5</span>
              <span className="font-normal">#848484</span>
            </li>
            <li className="flex flex-col gap-1 rounded-[6px] bg-gray-4 p-4 text-white">
              <span className="text-sm">Gray4</span>
              <span className="font-normal">#A6A6A6</span>
            </li>
            <li className="flex flex-col gap-1 rounded-[6px] bg-gray-3 p-4 text-gray-6">
              <span className="text-sm">Gray3</span>
              <span className="font-normal">#D2D2D2</span>
            </li>
            <li className="flex flex-col gap-1 rounded-[6px] bg-gray-2 p-4 text-gray-6">
              <span className="text-sm">Gray2</span>
              <span className="font-normal">#ECECEC</span>
            </li>
            <li className="flex flex-col gap-1 rounded-[6px] bg-gray-1 p-4 text-gray-6">
              <span className="text-sm">Gray1</span>
              <span className="font-normal">#F6F6F6</span>
            </li>
          </ul>
        </div>
      </section>
      <section className="border">
        <h1 className="text-h5 font-bold border-b px-4 py-2 ">Button</h1>
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center gap-4">
            <Button variant="primary" size="md">
              Primary
            </Button>
            <Button variant="primary" size="md" disabled>
              Primary
            </Button>
            <Button variant="primary-outline" size="md">
              Gray
            </Button>
            <Button variant="primary-outline" size="md" disabled>
              Gray
            </Button>
            <Button variant="gray" size="md">
              Primary Outline
            </Button>
            <Button variant="gray" size="md" disabled>
              Primary Outline
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="gray"
              size="md"
              prefix={
                <Image
                  aria-hidden
                  src="/images/window.svg"
                  alt="Window icon"
                  width={16}
                  height={16}
                />
              }
            >
              Prefix Button
            </Button>
            <Button
              variant="gray"
              size="md"
              suffix={
                <Image
                  aria-hidden
                  src="/images/window.svg"
                  alt="Window icon"
                  width={16}
                  height={16}
                />
              }
            >
              Suffix Button
            </Button>
            <Button
              variant="gray"
              size="md"
              prefix={
                <Image
                  aria-hidden
                  src="/images/window.svg"
                  alt="Window icon"
                  width={16}
                  height={16}
                />
              }
              suffix={
                <Image
                  aria-hidden
                  src="/images/window.svg"
                  alt="Window icon"
                  width={16}
                  height={16}
                />
              }
            >
              Prefix + Suffix Button
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="gray" size="lg">
              Large
            </Button>
            <Button variant="gray" size="md">
              Medium
            </Button>
            <Button variant="gray" size="sm">
              Small
            </Button>
          </div>
        </div>
      </section>
      <section className="border">
        <h1 className="text-h5 font-bold border-b px-4 py-2 ">TextField</h1>
        <div className="flex flex-col gap-4 p-4">
          <TextField placeholder="Normal" />
          <TextField placeholder="Normal" value="Normal Value" />
          <TextField placeholder="Disabled" disabled={true} />
          <TextField
            placeholder="Invaild"
            value="Invaild Value"
            invalid={true}
            errorMessage="Invaild Message"
          />
        </div>
      </section>
      <section className="border">
        <h1 className="text-h5 font-bold border-b px-4 py-2 ">TextArea</h1>
        <div className="flex flex-col gap-4 p-4">
          <TextArea placeholder="Normal" />
          <TextArea placeholder="Normal" value="Normal Value" />
          <TextArea placeholder="Disabled" disabled={true} />
          <TextArea
            placeholder="Invaild"
            value="Invaild Value"
            invalid={true}
            errorMessage="Invaild Message"
          />
        </div>
      </section>
    </div>
  );
}
