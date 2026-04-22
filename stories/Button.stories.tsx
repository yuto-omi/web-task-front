import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Button } from "@/app/components/Button";

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    onClick: fn(),
    children: "ボタン",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "ghost", "destructive"],
      description: "ボタンのスタイルバリアント",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "ボタンのサイズ",
    },
    loading: {
      control: "boolean",
      description: "ローディング状態。trueの場合、スピナーを表示しボタンを無効化する",
    },
    disabled: {
      control: "boolean",
      description: "無効状態。trueの場合、ボタンを無効化する",
    },
    submit: {
      control: "boolean",
      description: "trueの場合、type=submitになる（フォーム送信用）",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "ボタン",
  },
};

export const Loading: Story = {
  args: {
    children: "送信中...",
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: "無効",
    disabled: true,
  },
};

export const Submit: Story = {
  args: {
    children: "送信",
    submit: true,
  },
};

export const Outline: Story = {
  args: {
    children: "アウトライン",
    variant: "outline",
  },
};

export const Ghost: Story = {
  args: {
    children: "ゴースト",
    variant: "ghost",
  },
};

export const Destructive: Story = {
  args: {
    children: "削除",
    variant: "destructive",
  },
};

export const Small: Story = {
  args: {
    children: "小さい",
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    children: "大きい",
    size: "lg",
  },
};

export const LoadingOutline: Story = {
  name: "Loading + Outline",
  args: {
    children: "保存中...",
    loading: true,
    variant: "outline",
  },
};
