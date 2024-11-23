"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

import JSONPretty from "react-json-pretty";

interface JsonDisplayProps {
  title: string;
  description: string;
  data: Record<string, unknown>;
}

export function JsonDisplay({ title, description, data }: JsonDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md bg-zinc-950 p-4">
          <JSONPretty
            data={data}
            space="2"
            mainStyle="padding:1em;line-height:1.3;color:#66d9ef;background:transparent;"
          />
        </div>
      </CardContent>
    </Card>
  );
}
