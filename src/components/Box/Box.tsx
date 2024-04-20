"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect, use } from "react";


interface BoxProps {
  className?: string;
}


export function Box({ className }: BoxProps) {

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      setIsVisible(true);
    }, []);

  return (
<div
      className={cn(
        "bg-black text-white p-8 rounded-lg shadow-lg",
        "border border-gray-500 border",
        "flex flex-col items-center justify-center",
        "h-[50vh]",
        className
      )}
      style={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.5s ease-in-out",
      }}
    >
      <h1 className="text-4xl font-bold mb-6">Young Dream Data</h1>
      <p className="text-gray-400 mb-12 text-center">A nova era da educação</p>
      <div className="flex space-x-4">
        <Button variant="secondary" className="w-40">
          Entre com e-mail
        </Button>
        <Button variant="ghost" className="w-40 border border-gray-500">
          Cadastre-se
        </Button>
      </div>
    </div>
  );
}