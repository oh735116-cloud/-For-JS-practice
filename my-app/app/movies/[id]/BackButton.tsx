"use client";

import { useRouter } from "next/navigation";

type BackButtonProps = {
  className: string;
};

export default function BackButton({ className }: BackButtonProps) {
  const router = useRouter();

  return (
    <button className={className} type="button" onClick={() => router.back()}>
      ← 이전 페이지로
    </button>
  );
}
