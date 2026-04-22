import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/app/components/Button";

describe("Button", () => {
  it("テキストを表示する", () => {
    render(<Button>送信</Button>);
    expect(screen.getByRole("button", { name: "送信" })).toBeInTheDocument();
  });

  it("デフォルトのtype属性はbutton", () => {
    render(<Button>送信</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("submit=trueの場合、type属性はsubmit", () => {
    render(<Button submit>送信</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("disabled=trueの場合、ボタンが無効になる", () => {
    render(<Button disabled>送信</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("loading=trueの場合、ボタンが無効になりaria-busyが設定される", () => {
    render(<Button loading>送信</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("loading=trueの場合、スピナーアイコンが表示される", () => {
    render(<Button loading>送信</Button>);
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("onClickが呼ばれる", async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>送信</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disabled時にonClickが呼ばれない", async () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>送信</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("loading時にonClickが呼ばれない", async () => {
    const handleClick = jest.fn();
    render(<Button loading onClick={handleClick}>送信</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
