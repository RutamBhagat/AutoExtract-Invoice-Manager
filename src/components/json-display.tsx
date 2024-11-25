"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

import ReactJson from "react-json-view";

interface JsonDisplayProps {
  title: string;
  description?: string;
  data: Record<string, unknown> | Array<unknown>;
}

export function JsonDisplay({ title, description, data }: JsonDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-md bg-zinc-800">
          <ReactJson
            src={data}
            theme="monokai"
            collapsed={false}
            enableClipboard={true}
            displayDataTypes={true}
            displayObjectSize={true}
            style={{
              padding: "1em",
              lineHeight: "1.3",
              backgroundColor: "transparent",
              color: "#ffffff",
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
