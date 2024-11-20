"use client";

import React from "react";
import { useCounterStore } from "@/providers/counter-store-provider";

export default function page() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { count, incrementCount, decrementCount } = useCounterStore(
    (state) => state,
  );

  return (
    <div>
      Count: {count}
      <hr />
      <button type="button" onClick={() => void incrementCount()}>
        Increment Count
      </button>
      <button type="button" onClick={() => void decrementCount()}>
        Decrement Count
      </button>
    </div>
  );
}
