import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { SampleForm } from "@/app/components/SampleForm";

const meta = {
  title: "Components/SampleForm",
  component: SampleForm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    onSuccess: fn(),
  },
  argTypes: {
    onSuccess: {
      description: "送信成功時に呼ばれるコールバック。APIレスポンスを引数として受け取る",
    },
  },
} satisfies Meta<typeof SampleForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSuccessCallback: Story = {
  name: "送信成功コールバックあり",
  args: {
    onSuccess: fn(),
  },
};
