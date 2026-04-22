import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SampleForm } from "@/app/components/SampleForm";

jest.mock("@/lib/api", () => ({
  apiFetch: jest.fn(),
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

import { apiFetch } from "@/lib/api";
import toast from "react-hot-toast";

const mockedApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;
const mockedToast = toast as jest.Mocked<typeof toast>;

describe("SampleForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("フォームの各フィールドとボタンが表示される", () => {
    render(<SampleForm />);
    expect(screen.getByLabelText("名前")).toBeInTheDocument();
    expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "送信" })).toBeInTheDocument();
  });

  it("送信ボタンはtype=submitである", () => {
    render(<SampleForm />);
    expect(screen.getByRole("button", { name: "送信" })).toHaveAttribute("type", "submit");
  });

  it("未入力のまま送信するとバリデーションエラーが表示される", async () => {
    render(<SampleForm />);
    await userEvent.click(screen.getByRole("button", { name: "送信" }));
    expect(await screen.findByText("名前は必須です")).toBeInTheDocument();
    expect(screen.getByText("メールアドレスは必須です")).toBeInTheDocument();
  });

  it("不正なメールアドレスを入力するとバリデーションエラーが表示される", async () => {
    render(<SampleForm />);
    await userEvent.type(screen.getByLabelText("名前"), "テスト");
    await userEvent.type(screen.getByLabelText("メールアドレス"), "invalid-email");
    await userEvent.click(screen.getByRole("button", { name: "送信" }));
    expect(await screen.findByText("メールアドレスの形式が正しくありません")).toBeInTheDocument();
  });

  it("送信成功時にAPIが呼ばれ成功トーストが表示される", async () => {
    mockedApiFetch.mockResolvedValueOnce({ message: "送信しました" });
    render(<SampleForm />);
    await userEvent.type(screen.getByLabelText("名前"), "テスト太郎");
    await userEvent.type(screen.getByLabelText("メールアドレス"), "test@example.com");
    await userEvent.click(screen.getByRole("button", { name: "送信" }));
    await waitFor(() => {
      expect(mockedApiFetch).toHaveBeenCalledWith("/api/sample", {
        method: "POST",
        body: JSON.stringify({ name: "テスト太郎", email: "test@example.com" }),
      });
      expect(mockedToast.success).toHaveBeenCalledWith("送信しました");
    });
  });

  it("送信失敗時にエラートーストが表示される", async () => {
    mockedApiFetch.mockRejectedValueOnce(new Error("サーバーエラー"));
    render(<SampleForm />);
    await userEvent.type(screen.getByLabelText("名前"), "テスト太郎");
    await userEvent.type(screen.getByLabelText("メールアドレス"), "test@example.com");
    await userEvent.click(screen.getByRole("button", { name: "送信" }));
    await waitFor(() => {
      expect(mockedToast.error).toHaveBeenCalledWith("サーバーエラー");
    });
  });

  it("送信成功後にonSuccessコールバックが呼ばれる", async () => {
    const mockResponse = { message: "送信しました" };
    mockedApiFetch.mockResolvedValueOnce(mockResponse);
    const onSuccess = jest.fn();
    render(<SampleForm onSuccess={onSuccess} />);
    await userEvent.type(screen.getByLabelText("名前"), "テスト太郎");
    await userEvent.type(screen.getByLabelText("メールアドレス"), "test@example.com");
    await userEvent.click(screen.getByRole("button", { name: "送信" }));
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockResponse);
    });
  });
});
