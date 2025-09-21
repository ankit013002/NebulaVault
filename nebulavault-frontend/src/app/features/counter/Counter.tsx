"use client";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { increment, decrement, selectCount } from "./counterSlice";

export default function Counter() {
  const count = useAppSelector(selectCount);
  const dispatch = useAppDispatch();
  return (
    <div>
      <button className="btn" onClick={() => dispatch(decrement())}>
        -
      </button>
      <span>{count}</span>
      <button className="btn" onClick={() => dispatch(increment())}>
        +
      </button>
    </div>
  );
}
